const { BadRequestError, NotFoundError } = require("../core/error.response");
const prisma = require("../config/prisma");
const {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
} = require("../validators/work-schedule.validator");

class WorkScheduleService {
  async createWorkSchedule(workScheduleData) {
    try {
      // Validate input
      const { error } = createWorkScheduleSchema.validate(workScheduleData);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      // Check if user exists and has correct role
      const user = await prisma.user.findUnique({
        where: { id: workScheduleData.user_id },
      });
      if (!user) {
        throw new NotFoundError("Không tìm thấy người dùng");
      }

      // Check if clinic exists
      const clinic = await prisma.clinic.findUnique({
        where: { id: workScheduleData.clinic_id },
      });
      if (!clinic) {
        throw new NotFoundError("Không tìm thấy phòng khám");
      }

      // Check if shift exists
      const shift = await prisma.shift.findUnique({
        where: { id: workScheduleData.shift_id },
      });
      if (!shift) {
        throw new NotFoundError("Không tìm thấy ca làm việc");
      }

      // Check for schedule conflict
      const existingSchedule = await prisma.workSchedule.findFirst({
        where: {
          user_id: workScheduleData.user_id,
          work_date: workScheduleData.work_date,
          shift_id: workScheduleData.shift_id,
        },
      });

      if (existingSchedule) {
        throw new BadRequestError(
          "Đã tồn tại lịch làm việc cho người dùng này trong ca này"
        );
      }

      // Create work schedule
      const workSchedule = await prisma.workSchedule.create({
        data: workScheduleData,
        include: {
          user: true,
          clinic: true,
          shift: true,
        },
      });

      // Sau khi tạo workSchedule, tạo availableSlot tương ứng nếu chưa tồn tại
      const existingSlot = await prisma.availableSlot.findFirst({
        where: {
          doctor_id: workSchedule.user_id,
          clinic_id: workSchedule.clinic_id,
          slot_date: workSchedule.work_date,
          start_time: workSchedule.shift.start_time,
          end_time: workSchedule.shift.end_time,
        },
      });
      if (!existingSlot) {
        await prisma.availableSlot.create({
          data: {
            doctor_id: workSchedule.user_id,
            clinic_id: workSchedule.clinic_id,
            slot_date: workSchedule.work_date,
            start_time: workSchedule.shift.start_time,
            end_time: workSchedule.shift.end_time,
            is_available: true,
          },
        });
      }

      return workSchedule;
    } catch (error) {
      throw error;
    }
  }

  async getWorkSchedules(filters = {}) {
    try {
      const { user_id, clinic_id, start_date, end_date } = filters;

      const where = {};
      if (user_id) where.user_id = parseInt(user_id);
      if (clinic_id) where.clinic_id = parseInt(clinic_id);
      if (start_date && end_date) {
        where.work_date = {
          gte: new Date(start_date),
          lte: new Date(end_date),
        };
      }

      const workSchedules = await prisma.workSchedule.findMany({
        where,
        include: {
          user: true,
          clinic: true,
          shift: true,
        },
        orderBy: {
          work_date: "asc",
        },
      });

      return workSchedules;
    } catch (error) {
      throw error;
    }
  }

  async getWorkScheduleById(id) {
    try {
      const workSchedule = await prisma.workSchedule.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          clinic: true,
          shift: true,
        },
      });

      if (!workSchedule) {
        throw new NotFoundError("Không tìm thấy lịch làm việc");
      }

      return workSchedule;
    } catch (error) {
      throw error;
    }
  }

  async updateWorkSchedule(id, updateData) {
    try {
      // Validate input
      const { error } = updateWorkScheduleSchema.validate(updateData);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      // Check if work schedule exists
      const existingSchedule = await prisma.workSchedule.findUnique({
        where: { id: parseInt(id) },
        include: {
          shift: true,
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            }
          },
          clinic: true,
        },
      });

      if (!existingSchedule) {
        throw new NotFoundError("Không tìm thấy lịch làm việc");
      }

      // Check for schedule conflict if updating user, date, or shift
      if (updateData.user_id || updateData.work_date || updateData.shift_id) {
        const conflictSchedule = await prisma.workSchedule.findFirst({
          where: {
            user_id: updateData.user_id || existingSchedule.user_id,
            work_date: updateData.work_date || existingSchedule.work_date,
            shift_id: updateData.shift_id || existingSchedule.shift_id,
            id: { not: parseInt(id) },
          },
        });

        if (conflictSchedule) {
          throw new BadRequestError(
            "Đã tồn tại lịch làm việc cho người dùng này trong ca này"
          );
        }
      }

      // Update work schedule
      const updatedSchedule = await prisma.workSchedule.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          user: true,
          clinic: true,
          shift: true,
        },
      });

      // Nếu có thay đổi về shift, work_date, user_id hoặc clinic_id, cập nhật available slot
      if (updateData.shift_id || updateData.work_date || updateData.user_id || updateData.clinic_id) {
        // Lấy thông tin shift mới nếu có thay đổi
        const newShift = updateData.shift_id
          ? await prisma.shift.findUnique({ where: { id: updateData.shift_id } })
          : existingSchedule.shift;

        // Xóa available slot cũ
        await prisma.availableSlot.deleteMany({
          where: {
            doctor_id: existingSchedule.user_id,
            clinic_id: existingSchedule.clinic_id,
            slot_date: existingSchedule.work_date,
            start_time: existingSchedule.shift.start_time,
            end_time: existingSchedule.shift.end_time,
          },
        });

        // Tạo available slot mới
        await prisma.availableSlot.create({
          data: {
            doctor_id: updateData.user_id || existingSchedule.user_id,
            clinic_id: updateData.clinic_id || existingSchedule.clinic_id,
            slot_date: updateData.work_date || existingSchedule.work_date,
            start_time: newShift.start_time,
            end_time: newShift.end_time,
            is_available: true,
          },
        });
      }

      return updatedSchedule;
    } catch (error) {
      throw error;
    }
  }

  async deleteWorkSchedule(id) {
    try {
      // Check if work schedule exists
      const existingSchedule = await prisma.workSchedule.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingSchedule) {
        throw new NotFoundError("Không tìm thấy lịch làm việc");
      }

      // Nếu có entity khác phụ thuộc, kiểm tra tại đây (ví dụ: booking, appointment...)
      // Ví dụ:
      // const hasBooking = await prisma.booking.findFirst({ where: { workScheduleId: parseInt(id) } });
      // if (hasBooking) {
      //   throw new BadRequestError("Không thể xóa lịch làm việc đang có lịch hẹn");
      // }

      // Delete work schedule
      await prisma.workSchedule.delete({
        where: { id: parseInt(id) },
      });

      return { message: "Xóa lịch làm việc thành công" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WorkScheduleService();
