const { BadRequestError, NotFoundError } = require("../core/error.response");
const prisma = require("../config/prisma");
const {
  createClinicSchema,
  updateClinicSchema,
} = require("../validators/clinic.validator");

class ClinicService {
  async createClinic(clinicData) {
    try {
      // Validate input
      const { error } = createClinicSchema.validate(clinicData);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      // Check if clinic with same name exists
      const existingClinic = await prisma.clinic.findFirst({
        where: { name: clinicData.name },
      });

      if (existingClinic) {
        throw new BadRequestError("Tên phòng khám đã tồn tại");
      }

      // Create clinic
      const clinic = await prisma.clinic.create({
        data: clinicData,
      });

      return clinic;
    } catch (error) {
      throw error;
    }
  }

  async getAllClinics(search = "") {
    try {
      // Build where clause for search
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      // Get all clinics (no pagination)
      const clinics = await prisma.clinic.findMany({
        where,
        orderBy: { id: "desc" },
      });

      return {
        clinics,
        total: clinics.length,
        totalPages: 1,
        currentPage: 1,
      };
    } catch (error) {
      throw error;
    }
  }

  async getClinicById(id) {
    try {
      // Convert id to integer
      const clinicId = parseInt(id);
      if (isNaN(clinicId)) {
        throw new BadRequestError("ID phòng khám không hợp lệ");
      }

      const clinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
      });

      if (!clinic) {
        throw new NotFoundError("Không tìm thấy phòng khám");
      }

      return clinic;
    } catch (error) {
      throw error;
    }
  }

  async updateClinic(id, updateData) {
    try {
      // Convert id to integer
      const clinicId = parseInt(id);
      if (isNaN(clinicId)) {
        throw new BadRequestError("ID phòng khám không hợp lệ");
      }

      // Validate input
      const { error } = updateClinicSchema.validate(updateData);
      if (error) {
        throw new BadRequestError(error.details[0].message);
      }

      // Check if clinic exists
      const existingClinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
      });

      if (!existingClinic) {
        throw new NotFoundError("Không tìm thấy phòng khám");
      }

      // If name is being updated, check if new name is already in use
      if (updateData.name && updateData.name !== existingClinic.name) {
        const nameExists = await prisma.clinic.findFirst({
          where: { name: updateData.name },
        });

        if (nameExists) {
          throw new BadRequestError("Tên phòng khám đã tồn tại");
        }
      }

      // Update clinic
      const updatedClinic = await prisma.clinic.update({
        where: { id: clinicId },
        data: updateData,
      });

      return updatedClinic;
    } catch (error) {
      throw error;
    }
  }

  async deleteClinic(id) {
    try {
      // Convert id to integer
      const clinicId = parseInt(id);
      if (isNaN(clinicId)) {
        throw new BadRequestError("ID phòng khám không hợp lệ");
      }

      // Check if clinic exists
      const existingClinic = await prisma.clinic.findUnique({
        where: { id: clinicId },
      });

      if (!existingClinic) {
        throw new NotFoundError("Không tìm thấy phòng khám");
      }

      // Check if clinic has any work schedules
      const hasWorkSchedules = await prisma.workSchedule.findFirst({
        where: { clinic_id: clinicId },
      });
      if (hasWorkSchedules) {
        throw new BadRequestError(
          "Không thể xóa phòng khám đang có lịch làm việc"
        );
      }

      // Delete clinic
      await prisma.clinic.delete({
        where: { id: clinicId },
      });

      return { message: "Xóa phòng khám thành công" };
    } catch (error) {
      throw error;
    }
  }
  static async getAllClinicsForDoctor() {
    const clinics = await prisma.clinic.findMany();

    const newClinics = await Promise.all(
      clinics.map(async (clinic) => {
        const total = await prisma.queue.count({
          where: {
            clinic_id: Number(clinic.id),
            status: {
              in: ["waiting", "in_progress"],
            },
          },
        });
        clinic.patient_volume =
          total > 20 ? "high" : total > 10 ? "medium" : "low";
        return clinic;
      })
    );

    return newClinics;
  }
}

module.exports = new ClinicService();
