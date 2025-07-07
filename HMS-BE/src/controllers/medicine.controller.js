const { OK, CREATED } = require("../core/success.response");
const MedicineService = require("../services/medicine.service");

class MedicineController {
  getAllMedicines = async (req, res) => {
    const result = await MedicineService.getAllMedicines();
    return new OK({
      message: "Lấy danh sách thuốc thành công",
      metadata: result,
    }).send(res);
  };
  getMedicines = async (req, res) => {
    const result = await MedicineService.getMedicines(req.body);
    return new OK({
      message: "Lấy danh sách thuốc thành công",
      metadata: result,
    }).send(res);
  };
  

  getMedicineById = async (req, res) => {
    const result = await MedicineService.getMedicineById(+req.params.id);
    return new OK({
      message: "Lấy thuốc theo ID thành công",
      metadata: result,
    }).send(res);
  };

  createMedicine = async (req, res) => {
    const result = await MedicineService.createMedicine(req.body);
    return new CREATED({
      message: "Thêm thuốc mới thành công",
      metadata: result,
    }).send(res);
  };

  updateMedicine = async (req, res) => {
    const result = await MedicineService.updateMedicine(+req.params.id, req.body);
    return new OK({
      message: "Cập nhật thuốc thành công",
      metadata: result,
    }).send(res);
  };

  deleteMedicine = async (req, res) => {
    const result = await MedicineService.deleteMedicine(+req.params.id);
    return new OK({
      message: "Xoá thuốc thành công",
      metadata: result,
    }).send(res);
  };
}

module.exports = new MedicineController();
