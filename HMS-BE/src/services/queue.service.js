const prisma = require("../config/prisma");
const { getIO } = require("../config/socket.js");
const ExaminationRecordService = require("./examinationRecord.service");
const { sendPatientQueueNumberEmail } = require("../utils/staff.email");

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
    console.log(queueClinicdata)

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
    console.log(queueClinic);

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

  static async createOrderAndAssignToDoctorQueue({
    patient_id,
    from_clinic_id,
    to_clinic_id,
    to_doctor_id,
    reason = "",
    note = "",
    extra_cost = 0,
    appointment_id,
    priority = 2,
  }) {

    console.log(">>> createOrderAndAssignToDoctorQueue params:",
      patient_id,
      from_clinic_id,
      to_clinic_id,
      to_doctor_id,
      reason,
      note,
      extra_cost,
      appointment_id,
      priority,
    )

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointment_id },
    });

    if (!appointment) {
      throw new Error("Appointment không tồn tại.");
    }


    // 1. Tìm slot rảnh gần nhất của bác sĩ
    const slot = await prisma.availableSlot.findFirst({
      where: {
        doctor_id: to_doctor_id,
        clinic_id: to_clinic_id,
        is_available: true,
  //      slot_date: { gte: new Date() },
      },
      orderBy: [
        { slot_date: "asc" },
        { start_time: "asc" },
      ],
    });

    console.log("first slot found:", slot);

    if (!slot) {
      throw new Error("Bác sĩ được chọn không có ca khám nào rảnh.");
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

    console.log("order created:", order);

    // 3. Kiểm tra xem bệnh nhân đã có trong hàng đợi chưa
    const existingQueue = await prisma.queue.findFirst({
      where: {
        patient_id,
        clinic_id: to_clinic_id,
        status: { in: ['waiting', 'in_progress'] },
      },
    });
    console.log(existingQueue)
    if (existingQueue) {
      throw new Error("Bệnh nhân đã có trong hàng đợi phòng khám này.");
    }

    console.log("slot found:", slot,);

    const slotTimeStr = this.formatTimeToString(slot.start_time); // Ví dụ: "10:00:00"


    // 4. Tạo queue mới bằng assignQueueNumber
    const queue = await QueueService.assignQueueNumber({
      appointment_id,
      patient_id,
      clinic_id: to_clinic_id,
      slot_date: slot.slot_date,
      slot_time: slotTimeStr,
      registered_online: false,
    });

    // 4.1 Cập nhật thêm doctor và priority cho queue vừa tạo (tìm theo appointment_id)
    const targetQueue = await prisma.queue.findFirst({
      where: { appointment_id },
    });

    if (targetQueue) {
      await prisma.queue.update({
        where: { id: targetQueue.id },
        data: {
          status: "done",
        },
      });
    }



    console.log("queue created:", queue);

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
  static getShiftTypeAndRange(time) {
    if (time >= "08:00:00" && time < "12:00:00") {
      return { type: "morning", min: 1, max: 100 };
    }
    if (time >= "13:00:00" && time < "17:00:00") {
      return { type: "afternoon", min: 101, max: 200 };
    }
    if (time >= "18:00:00" && time < "22:00:00") {
      return { type: "night", min: 201, max: 300 };
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
    registered_online = true // 1: online, 0: walk-in
  }) {

    const shift = this.getShiftTypeAndRange(slot_time);
    if (!shift) throw new Error("Giờ khám không thuộc ca nào!");
    const { type, min, max } = shift;

    // Lấy số lớn nhất đã cấp trong ca này, ngày này, phòng khám này
    const lastQueue = await prisma.queue.findFirst({
      where: {
        clinic_id,
        shift_type: type,
        slot_date,
      },
      orderBy: { queue_number: "desc" }
    });
    const nextStt = lastQueue ? lastQueue.queue_number + 1 : min;
    if (nextStt > max) throw new Error("Đã hết chỗ trong ca này!");

    // Tạo queue mới
    const newQueue = await prisma.queue.create({
      data: {
        appointment_id,
        patient_id,
        clinic_id,
        status: "waiting",
        registered_online,
        queue_number: nextStt,
        shift_type: type,
        slot_date,
        created_at: new Date(),
      },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        appointment: appointment_id ? {
          include: {
            doctor: true,
            clinic: true
          }
        } : false,
        clinic: true
      }
    });

    // Gửi email thông báo số thứ tự cho bệnh nhân
    try {
      if (newQueue.patient?.user?.email) {
        // Đảm bảo slot_time được format đúng cho email
        const emailTime = typeof slot_time === 'string' ? slot_time :
          (slot_time instanceof Date ?
            `${slot_time.getHours().toString().padStart(2, '0')}:${slot_time.getMinutes().toString().padStart(2, '0')}:${slot_time.getSeconds().toString().padStart(2, '0')}` :
            '08:00:00');

        await sendPatientQueueNumberEmail(
          newQueue.patient.user.email,
          newQueue.patient.user.full_name || "Bệnh nhân",
          newQueue.queue_number,
          newQueue.shift_type,
          newQueue.slot_date instanceof Date ? newQueue.slot_date.toISOString().slice(0, 10) : newQueue.slot_date,
          emailTime,
          newQueue.appointment?.doctor?.full_name || "Bác sĩ chưa xác định",
          newQueue.clinic?.name || "Phòng khám"
        );
      }
    } catch (err) {
      console.error('Không thể gửi email thông báo số thứ tự:', err.message);
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
