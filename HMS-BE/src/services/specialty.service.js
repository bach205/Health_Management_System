const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");

class SpecialtyService {
  // Lấy tất cả chuyên khoa
  async getAllSpecialties() {
    try {
      const specialties = await prisma.specialty.findMany();

      return {
        total: specialties.length,
        specialties,
      };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }
  async getSpecialties(pagination = {}) {
    function sort(sortBy) {
      switch (sortBy) {
        case "name_asc":
          return { name: "asc" };
        case "name_desc":
          return { name: "desc" };
        default:
          return { name: "asc" };
      }
    }
  
    const { searchKey, sortBy, skip, limit } = pagination;
  
    try {
      const whereClause = {
        ...(searchKey && {
          name: {
            contains: searchKey,
          },
        }),
      };
  
      const total = await prisma.specialty.count({ where: whereClause });
  
      const specialties = await prisma.specialty.findMany({
        where: whereClause,
        orderBy: sort(sortBy),
        skip: skip || 0,
        take: limit || undefined,
      });
  
      return { total, specialties };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }
  
  // Lấy chuyên khoa theo ID
  async getSpecialtyById(id) {
    try {
      const specialty = await prisma.specialty.findUnique({
        where: { id },
        include: {
          doctors: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!specialty) throw new BadRequestError("Không tìm thấy chuyên khoa");
      return specialty;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Tạo mới chuyên khoa
  async createSpecialty(data) {
    const { name } = data;

    if (!name?.trim()) {
      throw new BadRequestError("Tên chuyên khoa không được để trống");
    }

    try {
      const existing = await prisma.specialty.findFirst({
        where: { name: name.trim() },
      });
      if (existing) throw new BadRequestError("Chuyên khoa đã tồn tại");

      const specialty = await prisma.specialty.create({
        data: {
          name: name.trim(),
        },
      });
      return specialty;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Cập nhật chuyên khoa
  async updateSpecialty(id, data) {
    const { name } = data;

    if (!name?.trim()) {
      throw new BadRequestError("Tên chuyên khoa không được để trống");
    }

    try {
      const existing = await prisma.specialty.findUnique({ where: { id } });
      const existingName = await prisma.specialty.findFirst({ where: { name: name.trim() } });
      if (!existing) throw new BadRequestError("Không tìm thấy chuyên khoa");

      if (existingName && existingName.id !== id) {
        throw new BadRequestError("Chuyên khoa đã tồn tại");
      }

      const updated = await prisma.specialty.update({
        where: { id },
        data: {
          name: name.trim(),
        },
      });
      return updated;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Xoá chuyên khoa
  async deleteSpecialty(id) {
    try {
      const specialty = await prisma.specialty.findUnique({ where: { id } });
      if (!specialty) throw new BadRequestError("Không tìm thấy chuyên khoa");

      // Kiểm tra nếu có bác sĩ liên quan thì không xoá được
      const relatedDoctors = await prisma.doctor.updateMany({
        where: { specialty_id: id },
        data: { specialty_id: null },
      });
      if (relatedDoctors.length > 0) {
        throw new BadRequestError("Không thể xoá chuyên khoa đang được sử dụng");
      }

      await prisma.specialty.delete({ where: { id } });
      return { success: true, message: "Đã xoá chuyên khoa" };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }
}

module.exports = new SpecialtyService();
