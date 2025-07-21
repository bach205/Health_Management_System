const prisma = require("../config/prisma");
const { getIO } = require("../config/socket.js");
const ExaminationRecordService = require("./examinationRecord.service");
const { sendPatientQueueNumberEmail } = require("../utils/staff.email");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

class QueueService {
  /**
   * Lấy danh sách queue của phòng khám
   * @param {number} clinicId - ID phòng khám
   * @param {Object} query - Thông tin phân trang
   * @returns {Promise<Object>} Danh sách queue và thông tin phân trang
   */
  static async getQueueClinic(clinicId, query) {
    const { pageNumber = 1, pageSize = 10, type } = query;
    console.log(query)
    if (!clinicId) {
      throw new Error("Clinic ID is required");
    }

    // 1. Kiểm tra phòng khám tồn tại
    const clinic = await prisma.clinic.findUnique({
      where: {
        id: Number(clinicId),
      },
    });

    if (!clinic) {
      throw new Error("Clinic not found");
    }

    let status = {
      in: ["waiting", "in_progress"],
    }
    // Nếu có type thì lọc theo type
    if (["waiting", "in_progress", "done", "skipped"].includes(type)) {
      status = { in: [type] };
    }
    const queueClinicdata = await prisma.queue.findMany({
      where: {
        clinic_id: Number(clinicId),
        status: status,
      },
    });
    // console.log(queueClinicdata)

    // 2. Lấy danh sách queue theo thứ tự ưu tiên:
    // - Ưu tiên theo priority của appointment (cao xuống thấp)
    // - Nếu cùng priority thì ưu tiên theo thời gian đặt lịch (sớm lên trước)
    // - Nếu không có appointment thì ưu tiên theo thời gian vào queue (sớm lên trước)
    const queueClinic = await prisma.queue.findMany({
      where: {
        clinic_id: Number(clinicId),
        status: status,
      },
      orderBy: [
        { priority: "desc" },
        { appointment: { created_at: "asc" } },
        { created_at: "asc" }
      ],
      skip: (+pageNumber - 1) * +pageSize,
      take: +pageSize,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
    });
    // console.log(queueClinic);

    // 3. Tính toán thông tin phân trang
    const total = await prisma.queue.count({
      where: {
        clinic_id: Number(clinicId),
        status: {
          in: ["waiting", "in_progress"],
        },
      },
    });

    const totalPages = Math.ceil(total / pageSize);

    return { queueClinic, total, totalPages };
  }

  /**
   * Chỉ định thêm phòng khám cho bệnh nhân
   * @param {Object} params - Thông tin chỉ định
   * @returns {Promise<Object>} Thông tin queue mới
   */
  static async assignAdditionalClinic({
    patient_id,
    to_clinic_id,
    // record_id, // khong can record_id o day
    reason = "",
    note = "",
    priority = 2, // Mặc định priority cao nhất cho chuyển phòng
    slot_date,    // Thêm tham số này
    slot_time,    // Thêm tham số này
    registered_online = false // Thêm tham số này
  }) {
    // 1. Tìm queue hiện tại của bệnh nhân (chưa done và đang khám)
    const currentQueue = await prisma.queue.findFirst({
      where: {
        patient_id,
        status: {
          in: ["waiting", "in_progress"],
        },
      },
    });

    // 2. Nếu có, cập nhật thành done
    if (currentQueue) {
      await prisma.queue.update({
        where: { id: currentQueue.id },
        data: { status: "done" },
      });
    }

    // ?? Chưa có tạo queue mới 

    // 3. Kiểm tra bệnh nhân đã có trong hàng đợi phòng mới chưa
    const existing = await prisma.queue.findFirst({
      where: {
        patient_id,
        clinic_id: to_clinic_id,
        status: {
          in: ["waiting", "in_progress"],
        },
      },
    });

    if (existing) {
      throw new Error("Bệnh nhân đã có trong hàng đợi phòng này.");
    }

    // 4. Tạo mới bản ghi queue ở phòng khám mới bằng assignQueueNumber
    const newQueue = await QueueService.assignQueueNumber({
      appointment_id: null,
      patient_id,
      clinic_id: to_clinic_id,
      slot_date,
      slot_time,
      registered_online
    });

    // 5. Cập nhật record_id và priority nếu cần
    await prisma.queue.update({
      where: { id: newQueue.id },
      data: {
        // record_id,
        priority
      }
    });

    const newOrder = await prisma.examinationOrder.findFirst({
      where: {
        patient_id: newQueue.patient_id,
        clinic_id: newQueue.clinic_id,
        from_clinic_id: currentQueue ? currentQueue.clinic_id : null,
        to_clinic_id: to_clinic_id,
        reason,
      },
      orderBy: { created_at: "desc" }
    });

    // 6. Emit socket event để thông báo cho phòng khám mới
    const io = getIO();
    if (io) {
      io.to(`clinic_${to_clinic_id}`).emit("queue:assigned", {
        patient: newQueue.patient,
        queue: newQueue,
        clinicId: to_clinic_id,
      });
    }
    return newQueue;
  }

  static timeToSeconds(date) {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
  }
  /**
   * Tạo đơn chuyển khám và gán bệnh nhân vào hàng đợi của bác sĩ mới
   * Logic: Chỉ lấy slot rảnh trong tương lai (ngày mai trở đi hoặc hôm nay nhưng giờ chưa qua)
   */
  static async createOrderAndAssignToDoctorQueue({
    patient_id, // bệnh nhân
    from_clinic_id, // chuyển từ phòng khám này
    to_clinic_id, // sang phòng khám khác
    to_doctor_id, // bác sĩ ở phòng khám mới
    reason = "", // lý do chuyển phòng
    note = "", // ghi chú
    extra_cost = 0, // chi phí chuyển phòng
    appointment_id, // lịch hẹn khám
    priority = 2, // ưu tiên chuyển phòng
  }) {
    // Validate đầu vào
    if (!patient_id || !from_clinic_id || !to_clinic_id || !to_doctor_id || !appointment_id) {
      throw new Error("Thiếu thông tin chuyển phòng khám (bác sĩ, phòng khám, bệnh nhân, lịch hẹn)!");
    }
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointment_id },
    });
    if (!appointment) {
      throw new Error("Appointment không tồn tại.");
    }
    // 1. Tìm slot rảnh gần nhất của bác sĩ với logic ưu tiên:
    // - Slot phải > now (sau thời gian hiện tại)
    // - Gần nhất với lịch đang khám (appointment hiện tại)
    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const appointmentDate = dayjs(appointment.appointment_date).tz('Asia/Ho_Chi_Minh');
    // Tìm tất cả slot rảnh của bác sĩ trong tương lai (theo giờ VN)
    const allAvailableSlots = await prisma.availableSlot.findMany({
      where: {
        doctor_id: to_doctor_id,
        clinic_id: to_clinic_id,
        is_available: true,
      },
      orderBy: [
        { slot_date: "asc" },
        { start_time: "asc" },
      ],
    });
    // Lọc slot > now (theo giờ VN)
    const validSlots = allAvailableSlots.filter(slot => {
      const slotDateTime = dayjs(slot.slot_date + 'T' + slot.start_time).tz('Asia/Ho_Chi_Minh');
      return slotDateTime.isAfter(now);
    });
    // Lọc slot cùng ngày có thời gian sau appointment (xử lý ở application level)
    let sameDaySlots = allAvailableSlots.filter(slot => {
      return dayjs(slot.slot_date).isSame(appointmentDate, 'day');
    });
    const appointmentTimeSec = this.timeToSeconds(new Date(`1970-01-01T${appointment.appointment_time || appointment.appointmentTime}Z`));
    console.log(appointmentTimeSec);
    const validSameDaySlots = sameDaySlots.filter(slot => {
      const slotTimeSec = this.timeToSeconds(new Date(`1970-01-01T${slot.start_time}Z`));
      console.log(slotTimeSec)
      return slotTimeSec > appointmentTimeSec;
    });
 
    let slot = null;
    if (validSameDaySlots.length > 0) {
      slot = validSameDaySlots[0];
    } else if (validSlots.length > 0) {
      // Ưu tiên 2: Tìm slot trong tương lai (ngày khác)
      // Tìm slot gần nhất với appointment hiện tại
      let closestSlot = validSlots[0];
      let minTimeDiff = Math.abs(dayjs(closestSlot.slot_date + 'T' + closestSlot.start_time).tz('Asia/Ho_Chi_Minh').diff(appointmentDate));
      for (const s of validSlots) {
        const slotDateTime = dayjs(s.slot_date + 'T' + s.start_time).tz('Asia/Ho_Chi_Minh');
        const timeDiff = Math.abs(slotDateTime.diff(appointmentDate));
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestSlot = s;
        }
      }
      slot = closestSlot;
    }
    console.log(slot);
    if (!slot) {
      throw new Error("Không tìm được slot phù hợp cho bác sĩ ở phòng khám mới!");
    }
    // Convert slot_date, slot_time về Asia/Ho_Chi_Minh
    const slotDateVN = dayjs(slot.slot_date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    let slotTimeVN = slot.start_time;
    if (slot.start_time instanceof Date) {
      slotTimeVN = dayjs(slot.start_time).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
    }
    // 2. Tạo đơn chuyển khám
    const order = await prisma.examinationOrder.create({
      data: {
        doctor_id: to_doctor_id,
        patient_id,
        from_clinic_id,
        to_clinic_id,
        reason,
        note,
        extra_cost,
        appointment_id,
      },
      include: {
        doctor: true,
        patient: true,
        fromClinic: true,
        toClinic: true,
        appointment: true,
      },
    });
    // 3. Kiểm tra xem bệnh nhân đã có trong hàng đợi chưa
    const existingQueue = await prisma.queue.findFirst({
      where: {
        patient_id,
        clinic_id: to_clinic_id,
        status: { in: ['waiting', 'in_progress'] },
      },
    });
    if (existingQueue) {
      throw new Error("Bệnh nhân đã có trong hàng đợi phòng khám này.");
    }
    // 4. Tạo appointment mới cho bác sĩ mới
    const newAppointment = await prisma.appointment.create({
      data: {
        patient_id: patient_id,
        doctor_id: to_doctor_id,
        clinic_id: to_clinic_id,
        appointment_date: slotDateVN,
        appointment_time: slotTimeVN,
        status: "confirmed",
        priority: priority,
        reason: reason,
        note: note,
      },
      include: {
        doctor: true,
        clinic: true,
        patient: true,
      },
    });
    // 5. Tạo queue mới với appointment mới
    const queue = await QueueService.assignQueueNumber({
      appointment_id: newAppointment.id, // Sử dụng appointment mới
      patient_id,
      clinic_id: to_clinic_id,
      slot_date: slotDateVN,
      slot_time: slotTimeVN,
      registered_online: false,
    });
    // 6. Cập nhật trạng thái queue cũ thành done
    const oldQueue = await prisma.queue.findFirst({
      where: { 
        appointment_id: appointment_id,
        status: { in: ['waiting', 'in_progress'] }
      },
    });
    if (oldQueue) {
      await prisma.queue.update({
        where: { id: oldQueue.id },
        data: {
          status: "done",
        },
      });
    }
    await prisma.appointment.update({
      where: { id: appointment_id },
      data: {
        status: "completed",
      },
    });
    // 5. Emit socket thông báo cho FE
    const io = getIO();
    if (io) {
      io.to(`clinic_${to_clinic_id}`).emit("queue:assigned", {
        patient: queue.patient,
        queue,
        clinicId: to_clinic_id,
      });
    }
    return {
      order,
      queue,
      assignedDoctor: order.doctor,
      slot,
      newAppointment,
    };
  }
  static formatTimeToString(date) {
    return date.toISOString().substring(11, 19); // lấy từ index 11 đến 19: HH:mm:ss
  }


  /**
   * Cập nhật trạng thái queue
   * @param {number} queueId - ID queue
   * @param {string} status - Trạng thái mới
   * @returns {Promise<Object>} Thông tin queue đã cập nhật
   */
  static async updateQueueStatus(queueId, status) {
    // console.log(queueId, status);
    const updated = await prisma.queue.update({
      where: { id: Number(queueId) },
      data: {
        status,
        called_at: status === "in_progress" ? new Date() : null,
      },
      include: { patient: true, clinic: true, appointment: true },
    });

    // >>>>>> Tại queue Không cần tạo ExaminationRecord vì bác sĩ sẽ tạo examination record sau khi khám (queue status in_progress)

    // Nếu bắt đầu khám (in_progress), tạo ExaminationRecord nếu chưa có
    // if (status === "in_progress") {
    //   await ExaminationRecordService.createIfNotExists(updated.patient_id, updated.clinic_id, updated.appointment.doctor_id);
    // }

    // Nếu bệnh nhân vắng mặt (status = skipped), thêm vào danh sách đợi lại
    // if (status === "skipped") {
    //   const missedQueue = await prisma.queue.create({
    //     data: {
    //       patient_id: updated.patient_id,
    //       clinic_id: updated.clinic_id,
    //       // appointment_id: updated.appointment_id,
    //       status: "waiting",
    //       priority: updated.appointment?.priority || 0, // Giữ nguyên priority từ appointment
    //     },
    //     include: { patient: true },
    //   });

    //   // Emit socket event cho queue mới
    //   const io = getIO();
    //   if (io) {
    //     io.to(`clinic_${updated.clinic_id}`).emit("queue:missed", {
    //       patient: missedQueue.patient,
    //       queue: missedQueue,
    //       clinicId: updated.clinic_id,
    //     });
    //   }
    // }
    if (status === "skipped") {
      // Không tạo queue mới => coi như hủy khám
      console.log(`Patient ${updated.patient_id} skipped. No new queue created.`);
    }
    // Emit socket event cho trạng thái thay đổi
    const io = getIO();
    if (io) {
      io.to(`clinic_${updated.clinic_id}`).emit("queue:statusChanged", {
        queue: updated,
        clinicId: updated.clinic_id,
      });
    }
    return updated;
  }

  /**
   * Check-in vào queue từ appointment
   * @param {Object} params - Thông tin appointment
   * @returns {Promise<Object>} Thông tin queue mới
   */
  static async checkInFromAppointment({ appointment_id }) {
    // 1. Lấy thông tin appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointment_id },
      include: { patient: true }
    });
    if (!appointment) throw new Error("Không tìm thấy lịch hẹn!");

    // 2. Kiểm tra đã có queue cho appointment này chưa
    const existingQueue = await prisma.queue.findFirst({
      where: {
        appointment_id,
        status: { in: ["waiting", "in_progress"] },
      },
    });
    if (existingQueue) throw new Error("Đã check-in vào hàng đợi!");

    // 3. Xử lý thời gian appointment để tránh vấn đề múi giờ
    let appointmentTimeStr;
    if (typeof appointment.appointment_time === 'string') {
      appointmentTimeStr = appointment.appointment_time;
    } else if (appointment.appointment_time instanceof Date) {
      // Lấy giờ local thay vì UTC để tránh chuyển đổi múi giờ
      const hours = appointment.appointment_time.getHours().toString().padStart(2, '0');
      const minutes = appointment.appointment_time.getMinutes().toString().padStart(2, '0');
      const seconds = appointment.appointment_time.getSeconds().toString().padStart(2, '0');
      appointmentTimeStr = `${hours}:${minutes}:${seconds}`;
    } else {
      appointmentTimeStr = '08:00:00'; // Default time
    }

    // 4. Gọi assignQueueNumber để tạo queue mới
    const newQueue = await QueueService.assignQueueNumber({
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      clinic_id: appointment.clinic_id,
      slot_date: appointment.appointment_date,
      slot_time: appointmentTimeStr,
      registered_online: true
    });

    // 4. Emit socket event
    const io = getIO();
    if (io) {
      io.to(`clinic_${appointment.clinic_id}`).emit("queue:checkin", {
        patient: newQueue.patient,
        queue: newQueue,
        clinicId: appointment.clinic_id,
      });
    }
    return newQueue;
  }

  /**
   * Hủy queue khi hủy appointment
   * @param {Object} params - Thông tin appointment
   * @returns {Promise<Object>} Thông tin queue đã hủy
   */
  static async cancelQueueByAppointment({ appointment_id }) {
    // 1. Tìm queue liên kết với appointment này và chưa done/skipped
    const queue = await prisma.queue.findFirst({
      where: {
        appointment_id,
        status: { in: ["waiting", "in_progress"] },
      },
    });
    if (!queue) return null;

    // 2. Cập nhật trạng thái queue thành skipped
    const updated = await prisma.queue.update({
      where: { id: queue.id },
      data: { status: "skipped" },
    });

    // 3. Emit socket event cho trạng thái thay đổi
    const io = getIO();
    if (io) {
      io.to(`clinic_${queue.clinic_id}`).emit("queue:statusChanged", {
        queue: updated,
        clinicId: queue.clinic_id,
      });
    }

    return updated;
  }

  /**
   * Xác định ca và range STT dựa vào giờ khám (3 ca: sáng, chiều, đêm)
   * @param {string} time - Chuỗi giờ dạng 'HH:mm:ss'
   * @returns {{type: string, min: number, max: number} | null}
   */
  static getShiftTypeAndRange(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const t = timeStr.trim();
    console.log('🔎 [DEBUG] getShiftTypeAndRange nhận timeStr:', t);
    // Ca sáng: 06:00:00 - 11:59:59
    if (t >= '06:00:00' && t < '12:00:00') {
      return { type: 'morning', min: 1, max: 99 };
    }
    // Ca chiều: 12:00:00 - 17:59:59
    if (t >= '12:00:00' && t < '18:00:00') {
      return { type: 'afternoon', min: 100, max: 199 };
    }
    // Ca tối: 18:00:00 - 22:00:00
    if (t >= '18:00:00' && t <= '22:00:00') {
      return { type: 'night', min: 200, max: 299 };
    }
    return null;
  }

  /**
   * Cấp số thứ tự động cho queue khi xác nhận lịch hẹn hoặc walk-in
   * @param {Object} params - { appointment_id, patient_id, clinic_id, slot_date, slot_time, registered_online }
   * @returns {Promise<Object>} Queue mới
   */


  static async assignQueueNumber({
    appointment_id,
    patient_id,
    clinic_id,
    slot_date,
    slot_time,
    registered_online = true
  }) {
    // ====== LOG DEBUG ======
    console.log('🔍 [DEBUG] assignQueueNumber được gọi với params:', {
      appointment_id,
      patient_id,
      clinic_id,
      slot_date,
      slot_time,
      registered_online
    });
    // ====== END LOG ======

    // Xử lý slot_date và slot_time để tránh lỗi date parsing
    let slotDateVN = '';
    let slotTimeVN = '';
    
    // Xử lý slot_date
    if (typeof slot_date === 'string') {
      slotDateVN = slot_date.trim();
    } else if (slot_date instanceof Date) {
      slotDateVN = slot_date.toISOString().split('T')[0]; // Lấy YYYY-MM-DD
    } else {
      throw new Error('slot_date không hợp lệ');
    }
    
    // Xử lý slot_time
    if (typeof slot_time === 'string') {
      slotTimeVN = slot_time.trim();
    } else if (slot_time instanceof Date) {
      slotTimeVN = slot_time.toTimeString().slice(0, 8); // Lấy HH:mm:ss
    } else {
      throw new Error('slot_time không hợp lệ');
    }
    
    // Đảm bảo slot_time có đủ 3 phần
    if (/^\d{2}:\d{2}$/.test(slotTimeVN)) {
      slotTimeVN += ':00';
    }

    const shift = this.getShiftTypeAndRange(slotTimeVN);
    if (!shift) throw new Error(`Giờ khám không thuộc ca nào! slot_time: ${slotTimeVN}`);
    const { type, min, max } = shift;

    // Dùng queryRaw để lấy số thứ tự lớn nhất
    const rawResult = await prisma.$queryRaw`
      SELECT queue_number FROM queues
      WHERE clinic_id = ${clinic_id}
        AND shift_type = ${type}
        AND DATE(slot_date) = ${slotDateVN}
      ORDER BY queue_number DESC
      LIMIT 1
    `;
    const lastQueueNumber = Array.isArray(rawResult) && rawResult.length > 0 ? rawResult[0].queue_number : null;
    const nextStt = lastQueueNumber ? lastQueueNumber + 1 : min;
    if (nextStt > max) throw new Error('Đã hết chỗ trong ca này!');

    // Tạo queue mới bằng raw query để tránh lỗi date parsing
    const insertResult = await prisma.$executeRaw`
      INSERT INTO queues (
        appointment_id, patient_id, clinic_id, status, registered_online, 
        queue_number, shift_type, slot_date, created_at
      ) VALUES (
        ${appointment_id}, ${patient_id}, ${clinic_id}, 'waiting', ${registered_online},
        ${nextStt}, ${type}, ${slotDateVN}, NOW()
      )
    `;
    
    // Lấy queue vừa tạo bằng raw query
    const [newQueue] = await prisma.$queryRaw`
      SELECT 
        q.*,
        u.full_name as patient_name,
        u.email as patient_email,
        c.name as clinic_name,
        d.full_name as doctor_name
      FROM queues q
      LEFT JOIN users u ON q.patient_id = u.id
      LEFT JOIN clinics c ON q.clinic_id = c.id
      LEFT JOIN appointments a ON q.appointment_id = a.id
      LEFT JOIN users d ON a.doctor_id = d.id
      WHERE q.patient_id = ${patient_id}
        AND q.clinic_id = ${clinic_id}
        AND q.queue_number = ${nextStt}
        AND q.shift_type = ${type}
        AND DATE(q.slot_date) = ${slotDateVN}
      ORDER BY q.id DESC
      LIMIT 1
    `;

    // ====== LOG DEBUG ======
    console.log('✅ [DEBUG] Queue được tạo thành công:', {
      id: newQueue.id,
      queue_number: newQueue.queue_number,
      shift_type: newQueue.shift_type,
      patient_email: newQueue.patient_email,
      patient_name: newQueue.patient_name
    });
    // ====== END LOG ======

    // Gửi email nếu có email
    try {
      if (newQueue.patient_email) {
        console.log('📧 [DEBUG] Bắt đầu gửi email cho:', newQueue.patient_email);
        const emailTime = slotTimeVN;
        const emailDate = slotDateVN;
        await sendPatientQueueNumberEmail(
          newQueue.patient_email,
          newQueue.patient_name || 'Bệnh nhân',
          newQueue.queue_number,
          newQueue.shift_type,
          emailDate,
          emailTime,
          newQueue.doctor_name || 'Bác sĩ chưa xác định',
          newQueue.clinic_name || 'Phòng khám'
        );
        console.log('✅ [DEBUG] Email đã được gửi thành công!');
      } else {
        console.log('⚠️ [DEBUG] Không có email để gửi cho bệnh nhân');
      }
    } catch (err) {
      console.error('❌ [DEBUG] Lỗi khi gửi email:', err.message);
    }
    return newQueue;
  }

  /**
   * Lấy danh sách queue của tất cả bệnh nhân theo ngày
   * @param {string} dateStr - Ngày cần lấy (YYYY-MM-DD), nếu không có sẽ lấy hôm nay
   * @returns {Promise<Array>} Danh sách queue theo ngày
   */
  static async getQueuesByDate(dateStr) {
    let date;
    if (dateStr) {
      date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
    } else {
      date = new Date();
      date.setHours(0, 0, 0, 0);
    }
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const queues = await prisma.queue.findMany({
      where: {
        slot_date: {
          gte: date,
          lt: nextDay
        },
        status: {
          in: ["waiting", "in_progress"]
        }
      },
      orderBy: [
        { slot_date: "asc" },
        { queue_number: "asc" }
      ],
      include: {
        patient: {
          include: {
            user: true
          }
        },
        clinic: true
      }
    });
    return queues;
  }
}

module.exports = QueueService;
