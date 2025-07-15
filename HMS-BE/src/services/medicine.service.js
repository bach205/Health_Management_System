const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");

class MedicineService {
  // Lấy tất cả thuốc
  async getAllMedicines() { 
    try {
      const medicines = await prisma.medicine.findMany();
      return medicines;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  async getMedicines(pagination = {}) {
    function sort(sortBy) {
      switch (sortBy) {
        case "name_asc":
          return { name: "asc" };
        case "name_desc":
          return { name: "desc" };
        case "price_asc":
          return { price: "asc" };
        case "price_desc":
          return { price: "desc" };
        case "stock_asc":
          return { stock: "asc" };
        case "stock_desc":
          return { stock: "desc" };
        default:
          return { name: "asc" };
      }
    }
  
    const { searchKey, sortBy, skip, limit, minStock, maxStock } = pagination;
  
    try {
      const whereClause = {
        AND: [
          searchKey && {
            name: {
              contains: searchKey,
              // mode: "insensitive",
            },
          },
          // minStock != null && {
          //   stock: { gte: Number(minStock) },
          // },
          // maxStock != null && {
          //   stock: { lte: Number(maxStock) },
          // },
        ].filter(Boolean),
      };
  
      const total = await prisma.medicine.count({ where: whereClause });
  
      const medicines = await prisma.medicine.findMany({
        where: whereClause,
        orderBy: sort(sortBy),
        skip: skip || 0,
        take: limit || undefined,
      });
  
      return { total, medicines };
    } catch (error) {
      console.error(error);
      throw new BadRequestError(error.message);
    }
  }
  

  // Lấy thuốc theo ID
  async getMedicineById(id) {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id },
      });
      if (!medicine) throw new BadRequestError("Không tìm thấy thuốc");
      return medicine;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Tạo mới thuốc
  async createMedicine(data) {
    const { name, stock, price } = data;

    if (!name?.trim() || stock == null || price == null) {
      throw new BadRequestError("Thiếu thông tin thuốc");
    }

    if (price < 0) {
      throw new BadRequestError("Giá không hợp lệ");
    }

    try {
      const existing = await prisma.medicine.findFirst({
        where: { name },
      });
      if (existing) throw new BadRequestError("Thuốc đã tồn tại");

      const medicine = await prisma.medicine.create({
        data: {
          name: name.trim(),
          stock: Number(stock),
          price: Number(price),
        },
      });
      return medicine;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Cập nhật thuốc
  async updateMedicine(id, data) {
    const { name, stock, price } = data;

    if (!name?.trim() || stock == null || price == null) {
      throw new BadRequestError("Thiếu thông tin để cập nhật thuốc");
    }

    if (price < 0) {
      throw new BadRequestError("Giá không hợp lệ");
    }

    try {
      const existing = await prisma.medicine.findUnique({ where: { id } });
      const existingName = await prisma.medicine.findFirst({ where: { name: name.trim() } });
      if (!existing) throw new BadRequestError("Thuốc không tồn tại");
      
      if ( existingName && existingName.id !== id) throw new BadRequestError("Tên thuốc đã tồn tại");

      const updated = await prisma.medicine.update({
        where: { id },
        data: {
          name: name.trim(),
          stock: Number(stock),
          price: Number(price),
        },
      });
      return updated;
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Xoá thuốc
  async deleteMedicine(id) {
    try {
      const medicine = await prisma.medicine.findUnique({ where: { id } });
      if (!medicine) throw new BadRequestError("Không tìm thấy thuốc");

      await prisma.medicine.delete({ where: { id } });
      return { success: true, message: "Đã xoá thuốc" };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  // Bán thuốc mở rộng: chọn từng thuốc, nhập số lượng thực tế
  async sellMedicinesByRecord(record_id, items) {
    const prescriptionItemService = require("./prescriptionItem.service");
    // Lấy prescription items gốc
    const originalItems = await prescriptionItemService.prototype.getByRecordId(record_id);
    if (!originalItems || originalItems.length === 0) throw new BadRequestError("Không có đơn thuốc để bán");

    // Map prescription_item_id -> original item
    const originalMap = {};
    for (const item of originalItems) originalMap[item.id] = item;

    // Kiểm tra từng item thực tế
    const updates = [];
    let total = 0;
    const soldItems = [];
    for (const { prescription_item_id, quantity } of items) {
      const orig = originalMap[prescription_item_id];
      if (!orig) throw new BadRequestError(`Thuốc kê đơn không hợp lệ`);
      if (quantity < 1) throw new BadRequestError(`Số lượng phải lớn hơn 0`);
      // Nếu prescription item có trường quantity gốc, kiểm tra không vượt quá
      if (orig.quantity && quantity > orig.quantity) throw new BadRequestError(`Không được bán vượt quá số lượng kê`);
      // Kiểm tra tồn kho
      const medicine = await prisma.medicine.findUnique({ where: { id: orig.medicine_id } });
      if (!medicine) throw new BadRequestError(`Thuốc không tồn tại`);
      if (medicine.stock < quantity) throw new BadRequestError(`Thuốc ${medicine.name} không đủ tồn kho`);
      // Trừ kho
      updates.push(
        prisma.medicine.update({
          where: { id: orig.medicine_id },
          data: { stock: medicine.stock - quantity },
        })
      );
      total += Number(medicine.price) * quantity;
      soldItems.push({
        prescription_item_id,
        medicine_id: orig.medicine_id,
        medicine_name: medicine.name,
        quantity,
        price: Number(medicine.price),
        total: Number(medicine.price) * quantity
      });
    }
    await Promise.all(updates);
    // (Có thể lưu lịch sử phát thuốc, tạo hóa đơn ở đây)
    return { success: true, total, items: soldItems };
  }
}
module.exports = new MedicineService();
