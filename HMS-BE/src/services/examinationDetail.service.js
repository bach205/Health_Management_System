
// SERVICE REMOVED !!!!!!!

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
        to_doctor_id,    
        slot_date,      
        start_time,     
      } = data;

      // 1. Lấy hoặc tạo hồ sơ khám
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
      if (to_clinic_id && from_clinic_id && to_doctor_id && slot_date && start_time) {
        // 3.1 Tạo examination order
        const order = await prisma.examinationOrder.create({
          data: {
            doctor_id,
            patient_id: record.patient_id,
            from_clinic_id,
            to_clinic_id,
            total_cost: total_cost || 0,
          },
        });

        // 3.2 Tạo appointment cho phòng mới với priority cao
        const appointment = await prisma.appointment.create({
          data: {
            patient_id,
            clinic_id: to_clinic_id,
            doctor_id: to_doctor_id,
            appointment_date: slot_date,
            appointment_time: start_time,
            status: 'confirmed',
            reason: `Chuyển từ phòng ${from_clinic_id}`,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // 3.3 Tìm và cập nhật queue hiện tại thành done
        const currentQueue = await prisma.queue.findFirst({
          where: {
            patient_id,
            status: { in: ["waiting", "in_progress"] },
          },
        });

        if (currentQueue) {
          await prisma.queue.update({
            where: { id: currentQueue.id },
            data: { status: "done" },
          });
        }

        // 3.4 Tạo queue mới từ appointment (kết hợp logic từ checkInFromAppointment)
        const newQueue = await prisma.queue.create({
          data: {
            patient_id,
            clinic_id: to_clinic_id,
            appointment_id: appointment.id,
            record_id: record.id,
            status: "waiting",
            priority: 2,  // Giữ priority cao cho chuyển phòng
          },
          include: { patient: true },
        });

        // 3.5 Emit socket event
        const io = getIO();
        if (io) {
          // Emit event cho phòng mới
          io.to(`clinic_${to_clinic_id}`).emit("queue:assigned", {
            patient: newQueue.patient,
            queue: newQueue,
            clinicId: to_clinic_id,
          });
        
          // Emit event cho phòng cũ để cập nhật queue đã done
          io.to(`clinic_${from_clinic_id}`).emit("queue:statusChanged", {
            queue: currentQueue,
            clinicId: from_clinic_id,
          });
        }

      } else {
        // 4. Nếu không chuyển phòng, chỉ cập nhật queue hiện tại thành done
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
        appointment: true,
      },
      orderBy: { examined_at: "desc" },
    });
  }

  static async getDoctorsInClinic(clinicId) {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const activeDoctors = await prisma.workSchedule.findMany({
      where: {
        clinic_id: +clinicId,
        // work_date: {
        //   gte: todayStart,
        //   lte: todayEnd,
        // },
        // shift: {
        //   start_time: {
        //     lte: now,
        //   },
        //   end_time: {
        //     gte: now,
        //   },
        // },
      },
      include: {
        user: true, // để lấy thông tin bác sĩ
      },
    });

    return activeDoctors
  }


  static async getDoctorAvailableSlots(doctorId) {
    return prisma.availableSlot.findMany({
      where: {
        doctor_id: +doctorId,
      },
      include: {
        doctor: {
          select: {
            id: true,
            full_name: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

module.exports = ExaminationDetailService;
