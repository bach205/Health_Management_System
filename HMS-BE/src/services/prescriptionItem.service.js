const prisma = require("../config/prisma");
const { BadRequestError } = require("../core/error.response");

class PrescriptionItemService {
  // Lấy danh sách tất cả prescription items
  async getAll() {
    try {
      const items = await prisma.prescriptionItem.findMany({
        include: {
          medicine: true,
          prescription: true,
        },
      });
      return items;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Lấy theo ID
  async getById(id) {
    try {
      const item = await prisma.prescriptionItem.findUnique({
        where: { id: Number(id) },
        include: {
          medicine: true,
          prescription: true,
        },
      });
      if (!item) throw new BadRequestError("Không tìm thấy mục kê đơn");
      return item;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Tạo mới prescription item
  async create(data) {
    const { prescription_id, medicine_id, quantity, note } = data;

    if (!prescription_id || !medicine_id || !quantity) {
      throw new BadRequestError("Thiếu thông tin bắt buộc");
    }

    try {
      const item = await prisma.prescriptionItem.create({
        data: {
          prescription_id: Number(prescription_id),
          medicine_id: Number(medicine_id),
          quantity: Number(quantity),
          note: note?.trim() || null,
        },
        include: {
          medicine: true,
        },
      });
      return item;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Cập nhật prescription item
  async update(id, data) {
    try {
      const existing = await prisma.prescriptionItem.findUnique({ where: { id: Number(id) } });
      if (!existing) throw new BadRequestError("Không tìm thấy mục kê đơn");

      const updated = await prisma.prescriptionItem.update({
        where: { id: Number(id) },
        data: {
          quantity: data.quantity != null ? Number(data.quantity) : undefined,
          note: data.note?.trim(),
        },
      });

      return updated;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Xoá prescription item
  async delete(id) {
    try {
      const existing = await prisma.prescriptionItem.findUnique({ where: { id: Number(id) } });
      if (!existing) throw new BadRequestError("Không tìm thấy mục kê đơn");

      await prisma.prescriptionItem.delete({ where: { id: Number(id) } });
      return { message: "Xoá thành công", success: true };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Lấy danh sách theo prescription_id
  async getByPrescriptionId(prescriptionId) {
    try {
      const items = await prisma.prescriptionItem.findMany({
        where: {
          prescription_id: Number(prescriptionId),
        },
        include: {
          medicine: true,
        },
      });
      return items;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }
}

module.exports = new PrescriptionItemService();
