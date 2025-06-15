const { CREATED, OK } = require("../core/success.response");
const ClinicService = require("../services/clinic.service");

class ClinicController {
  async createClinic(req, res) {
    try {
      const result = await ClinicService.createClinic(req.body);
      return new CREATED({
        message: "Tạo phòng khám thành công",
        metadata: result,
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Tạo phòng khám thất bại",
        error: error.name,
      });
    }
  }

  async getAllClinics(req, res) {
    try {
      const { search } = req.query;
      const result = await ClinicService.getAllClinics(search);
      return new OK({
        message: "Lấy danh sách phòng khám thành công",
        metadata: result,
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Lấy danh sách phòng khám thất bại",
        error: error.name,
      });
    }
  }

  async getClinicById(req, res) {
    try {
      const { id } = req.params;
      const result = await ClinicService.getClinicById(id);
      return new OK({
        message: "Lấy thông tin phòng khám thành công",
        metadata: result,
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Lấy thông tin phòng khám thất bại",
        error: error.name,
      });
    }
  }

  async updateClinic(req, res) {
    try {
      const { id } = req.params;
      const result = await ClinicService.updateClinic(id, req.body);
      return new OK({
        message: "Cập nhật phòng khám thành công",
        metadata: result,
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Cập nhật phòng khám thất bại",
        error: error.name,
      });
    }
  }

  async deleteClinic(req, res) {
    try {
      const { id } = req.params;
      const result = await ClinicService.deleteClinic(id);
      return new OK({
        message: result.message,
        metadata: {},
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Xóa phòng khám thất bại",
        error: error.name,
      });
    }
  }
}

module.exports = new ClinicController();
