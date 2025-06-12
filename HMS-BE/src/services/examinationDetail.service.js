const prisma = require("../config/prisma");
const { getIO } = require("../config/socket.js");
const ExaminationRecordService = require("./examinationRecord.service");
const QueueService = require("./queue.service");

class ExaminationDetailService {
  static async create(data) {
    try {
      const {
        to_clinic_id,
        from_clinic_id,
        doctor_id,
        result,
        note,
        examined_at,
        status,
        clinic_id,
        patient_id,
        total_cost,
      } = data;

      // 1. Lấy hoặc tạo hồ sơ khám (nếu chưa có)
      const record = await ExaminationRecordService.createIfNotExists(patient_id);
      if (!record) throw new Error("Không tìm thấy hoặc tạo được hồ sơ khám");

      // 2. Tạo kết quả khám
      const detail = await prisma.examinationDetail.create({
        data: {
          record_id: record.id,
          clinic_id,
          doctor_id,
          result,
          note,
          examined_at,
          status,
        },
      });

      // 3. Nếu có chỉ định chuyển phòng
      if (to_clinic_id && from_clinic_id && doctor_id) {
        await prisma.examinationOrder.create({
          data: {
            doctor_id,
            patient_id: record.patient_id,
            from_clinic_id,
            to_clinic_id,
            total_cost: total_cost || 0,
          },
        });

        // 4. Tạo queue mới cho phòng tiếp theo với priority cao nhất
        await QueueService.assignAdditionalClinic({
          patient_id,
          to_clinic_id,
          record_id: record.id,
          priority: 2, // Priority cao nhất cho chuyển phòng
        });
      } else {
        // 5. Nếu không chuyển phòng, cập nhật queue hiện tại thành done
        await prisma.queue.updateMany({
          where: {
            patient_id: patient_id,
            status: { in: ["waiting", "in_progress"] },
          },
          data: {
            status: "done",
          },
        });
      }

      return detail;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async update(id, data) {
    return prisma.examinationDetail.update({
      where: { id: Number(id) },
      data,
    });
  }

  static async getById(id) {
    return prisma.examinationDetail.findUnique({
      where: { id: Number(id) },
      include: {
        record: true,
        clinic: true,
        doctor: true,
      },
    });
  }

  static async getAll(query = {}) {
    return prisma.examinationDetail.findMany({
      where: query,
      include: {
        record: true,
        clinic: true,
        doctor: true,
      },
      orderBy: { examined_at: "desc" },
    });
  }
}

module.exports = ExaminationDetailService;
