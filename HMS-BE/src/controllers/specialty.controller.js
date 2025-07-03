const { OK, CREATED } = require("../core/success.response");
const specialtyService = require("../services/specialty.service");

class SpecialtyController {
  // Lấy tất cả chuyên khoa
  getAllSpecialties = async (req, res) => {
    const result = await specialtyService.getAllSpecialties();
    return new OK({
      message: "Lấy danh sách chuyên khoa thành công",
      metadata: result,
    }).send(res);
  };
  getSpecialties = async (req, res) => {
    const result = await specialtyService.getSpecialties(req.body);
    return new OK({
      message: "Lấy danh sách chuyên khoa thành công",
      metadata: result,
    }).send(res);
  };

  // Lấy chuyên khoa theo ID
  getSpecialtyById = async (req, res) => {
    const result = await specialtyService.getSpecialtyById(+req.params.id);
    return new OK({
      message: "Lấy chuyên khoa theo ID thành công",
      metadata: result,
    }).send(res);
  };

  // Tạo chuyên khoa mới
  createSpecialty = async (req, res) => {
    const result = await specialtyService.createSpecialty(req.body);
    return new CREATED({
      message: "Tạo chuyên khoa thành công",
      metadata: result,
    }).send(res);
  };

  // Cập nhật chuyên khoa
  updateSpecialty = async (req, res) => {
    const result = await specialtyService.updateSpecialty(+req.params.id, req.body);
    return new OK({
      message: "Cập nhật chuyên khoa thành công",
      metadata: result,
    }).send(res);
  };

  // Xoá chuyên khoa
  deleteSpecialty = async (req, res) => {
    const result = await specialtyService.deleteSpecialty(+req.params.id);
    return new OK({
      message: "Xoá chuyên khoa thành công",
      metadata: result,
    }).send(res);
  };
}

module.exports = new SpecialtyController();
