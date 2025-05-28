const shiftService = require("../services/shift.service");

class ShiftController {
  async createShift(req, res) {
    try {
      const shift = await shiftService.createShift(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo ca làm việc thành công",
        data: shift,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi tạo ca làm việc",
      });
    }
  }

  async getShifts(req, res) {
    try {
      const shifts = await shiftService.getShifts();
      res.json({
        success: true,
        message: "Lấy danh sách ca làm việc thành công",
        data: shifts,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi lấy danh sách ca làm việc",
      });
    }
  }

  async getShiftById(req, res) {
    try {
      const shift = await shiftService.getShiftById(req.params.id);
      res.json({
        success: true,
        message: "Lấy thông tin ca làm việc thành công",
        data: shift,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi lấy thông tin ca làm việc",
      });
    }
  }

  async updateShift(req, res) {
    try {
      const shift = await shiftService.updateShift(req.params.id, req.body);
      res.json({
        success: true,
        message: "Cập nhật ca làm việc thành công",
        data: shift,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi cập nhật ca làm việc",
      });
    }
  }

  async deleteShift(req, res) {
    try {
      const result = await shiftService.deleteShift(req.params.id);
      res.json({
        success: true,
        message: "Xóa ca làm việc thành công",
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi xóa ca làm việc",
      });
    }
  }
}

module.exports = new ShiftController();
