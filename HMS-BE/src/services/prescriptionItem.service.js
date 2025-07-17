const prisma = require("../config/prisma");
const { BadRequestError } = require("../core/error.response");

class PrescriptionItemService {

  // Tạo nhiều prescription items
  // record_id: ID của bản ghi kê đơn
  static async createMany(record_id, items = []) {
    if (!record_id) throw new BadRequestError("Thiếu record_id");
    if (!Array.isArray(items)) throw new BadRequestError("Danh sách thuốc không hợp lệ");

    if (items.length === 0) return;

    const data = items.map(item => {
      if (!item.medicine_id) throw new BadRequestError("Thiếu medicine_id cho một thuốc");
      return {
        record_id,
        medicine_id: item.medicine_id,
        note: item.note ?? null,
        dosage: item.dosage ?? null,
        frequency: item.frequency ?? null,
        // duration: item.duration ?? null,
        quantity: item.quantity != null ? Number(item.quantity) : 1, // Mặc định là 1 nếu không có quantity
      };
    });

    return await prisma.prescriptionItem.createMany({ data });
  }

  // Lấy danh sách tất cả prescription items
  async getAll() {
    try {
      const items = await prisma.prescriptionItem.findMany({
        include: {
          medicine: true,
        },
      });
      return items;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Lấy danh sách prescription items theo record_id
  async getByRecordId(record_id) {
    try {
      const items = await prisma.prescriptionItem.findMany({
        where: { record_id: Number(record_id) },
        include: {
          medicine: true,
        },
      });
      return items;
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


module.exports = PrescriptionItemService;