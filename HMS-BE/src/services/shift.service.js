const { BadRequestError, NotFoundError } = require("../core/error.response");
const prisma = require("../config/prisma");
const {
  createShiftSchema,
  updateShiftSchema,
} = require("../validators/shift.validator");

class ShiftService {
  async createShift(shiftData) {
    try {
      // Validate input
      const { error } = createShiftSchema.validate(shiftData);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      // Check if shift with same name exists
      const existingShift = await prisma.shift.findFirst({
        where: { name: shiftData.name },
      });

      if (existingShift) {
        throw new BadRequestError("Tên ca làm việc đã tồn tại");
      }

      // Create shift
      const shift = await prisma.shift.create({
        data: shiftData,
      });

      return shift;
    } catch (error) {
      throw error;
    }
  }

  async getShifts() {
    try {
      const shifts = await prisma.shift.findMany({
        orderBy: {
          start_time: "asc",
        },
      });

      return shifts;
    } catch (error) {
      throw error;
    }
  }

  async getShiftById(id) {
    try {
      const shift = await prisma.shift.findUnique({
        where: { id: parseInt(id) },
      });

      if (!shift) {
        throw new NotFoundError("Không tìm thấy ca làm việc");
      }

      return shift;
    } catch (error) {
      throw error;
    }
  }

  async updateShift(id, updateData) {
    try {
      // Validate input
      const { error } = updateShiftSchema.validate(updateData);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      // Check if shift exists
      const existingShift = await prisma.shift.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingShift) {
        throw new NotFoundError("Không tìm thấy ca làm việc");
      }

      // If name is being updated, check if new name is already in use
      if (updateData.name && updateData.name !== existingShift.name) {
        const nameExists = await prisma.shift.findFirst({
          where: { name: updateData.name },
        });

        if (nameExists) {
          throw new BadRequestError("Tên ca làm việc đã tồn tại");
        }
      }

      // Update shift
      const updatedShift = await prisma.shift.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      // Update all related available slots
      if (updateData.start_time || updateData.end_time) {
        // Get all work schedules using this shift
        const workSchedules = await prisma.workSchedule.findMany({
          where: { shift_id: parseInt(id) },
          include: {
            shift: true,
          },
        });

        // Update available slots for each work schedule
        for (const schedule of workSchedules) {
          await prisma.availableSlot.updateMany({
            where: {
              doctor_id: schedule.user_id,
              clinic_id: schedule.clinic_id,
              slot_date: schedule.work_date,
              start_time: existingShift.start_time,
              end_time: existingShift.end_time,
            },
            data: {
              start_time: updateData.start_time || existingShift.start_time,
              end_time: updateData.end_time || existingShift.end_time,
            },
          });
        }
      }

      return updatedShift;
    } catch (error) {
      throw error;
    }
  }

  async deleteShift(id) {
    try {
      // Check if shift exists
      const existingShift = await prisma.shift.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingShift) {
        throw new NotFoundError("Không tìm thấy ca làm việc");
      }

      // Check if shift is being used in any work schedule
      const workSchedules = await prisma.workSchedule.findFirst({
        where: { shift_id: parseInt(id) },
      });

      if (workSchedules) {
        throw new BadRequestError(
          "Không thể xóa ca làm việc đang được sử dụng trong lịch làm việc"
        );
      }

      // Delete shift
      await prisma.shift.delete({
        where: { id: parseInt(id) },
      });

      return { message: "Xóa ca làm việc thành công" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ShiftService();
