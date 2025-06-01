const prisma = require("../config/prisma");
const { getIO } = require("../config/socket.js");

class QueueService {
  static async getQueueClinic(clinicId, query) {
    const { pageNumber = 1, pageSize = 10 } = query;

    if (!clinicId) {
      throw new Error("Clinic ID is required");
    }

    const clinic = await prisma.clinic.findUnique({
      where: {
        id: Number(clinicId),
      },
    });

    if (!clinic) {
      throw new Error("Clinic not found");
    }

    const queueClinic = await prisma.queue.findMany({
      where: {
        clinic_id: Number(clinicId),
        status: {
          in: ["waiting", "in_progress"],
        },
      },

      // Đoạn orderBy này sắp xếp các mục trong hàng đợi theo thứ tự:
      // 1. Trước tiên theo 'priority' giảm dần, tức là các mục có mức độ ưu tiên cao sẽ được xử lý trước.
      // 2. Nếu có nhiều mục có cùng mức độ ưu tiên, chúng sẽ được sắp xếp tiếp theo 'created_at' giảm dần,
      //    tức là mục được tạo gần đây hơn sẽ đứng trước.
      orderBy: [{ priority: "desc" }, { created_at: "desc" }],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        patient: true,
      },
    });

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

  static async assignAdditionalClinic({
    patient_id,
    to_clinic_id,
    record_id,
    priority = 0,
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

    // 5. Emit socket event như cũ
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

  static async updateQueueStatus(queueId, status) {
    const updated = await prisma.queue.update({
      where: { id: Number(queueId) },
      data: {
        status,
        called_at: status === "in_progress" ? new Date() : null,
      },
      include: { patient: true, clinic: true },
    });
    // Emit socket event
    const io = getIO();
    if (io) {
      io.to(`clinic_${updated.clinic_id}`).emit("queue:statusChanged", {
        queue: updated,
        clinicId: updated.clinic_id,
      });
    }
    return updated;
  }
}

module.exports = QueueService;
