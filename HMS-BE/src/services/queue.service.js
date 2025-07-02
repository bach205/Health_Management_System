const prisma = require("../config/prisma");
const { getIO } = require("../config/socket.js");
const ExaminationRecordService = require("./examinationRecord.service");

class QueueService {
  /**
   * Lấy danh sách queue của phòng khám
   * @param {number} clinicId - ID phòng khám
   * @param {Object} query - Thông tin phân trang
   * @returns {Promise<Object>} Danh sách queue và thông tin phân trang
   */
  static async getQueueClinic(clinicId, query) {
    const { pageNumber = 1, pageSize = 10 } = query;

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

    // 2. Lấy danh sách queue theo thứ tự ưu tiên:
    // - Ưu tiên theo priority của appointment (cao xuống thấp)
    // - Nếu cùng priority thì ưu tiên theo thời gian đặt lịch (sớm lên trước)
    // - Nếu không có appointment thì ưu tiên theo thời gian vào queue (sớm lên trước)
    const queueClinic = await prisma.queue.findMany({
      where: {
        clinic_id: Number(clinicId),
        status: {
          in: ["waiting", "in_progress"],
        },
      },
      orderBy: [
        { priority: "desc" },
        { appointment: { created_at: "asc" } },
        { created_at: "asc" }
      ],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        appointment: true,
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
    record_id,
    priority = 2, // Mặc định priority cao nhất cho chuyển phòng
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

    // 4. Tạo mới bản ghi queue ở phòng khám mới
    const newQueue = await prisma.queue.create({
      data: {
        patient_id,
        clinic_id: to_clinic_id,
        record_id,
        status: "waiting",
        priority,
      },
      include: { patient: true },
    });

    // 5. Emit socket event để thông báo cho phòng khám mới
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

    // Nếu bắt đầu khám (in_progress), tạo ExaminationRecord nếu chưa có
    if (status === "in_progress") {
      await ExaminationRecordService.createIfNotExists(updated.patient_id);
    }

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

    // 3. Tạo queue mới với priority từ appointment
    const newQueue = await prisma.queue.create({
      data: {
        patient_id: appointment.patient_id,
        clinic_id: appointment.clinic_id,
        appointment_id: appointment.id,
        status: "waiting",
        priority: appointment.priority || 0,
      },
      include: { patient: true },
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
    registered_online = 1 // 1: online, 0: walk-in
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
      }
    });
    return newQueue;
  }
}

module.exports = QueueService;
