const workScheduleService = require("../services/work-schedule.service");

class WorkScheduleController {
  async createWorkSchedule(req, res) {
    try {
      
      const workSchedule = await workScheduleService.createWorkSchedule(
        req.body
      );
      res.status(201).json({
        success: true,
        message: "Tạo lịch làm việc thành công",
        data: workSchedule,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi tạo lịch làm việc",
      });
    }
  }

  async getWorkSchedules(req, res) {
    try {
      const workSchedules = await workScheduleService.getWorkSchedules(
        req.query
      );
      res.json({
        success: true,
        message: "Lấy danh sách lịch làm việc thành công",
        data: workSchedules,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.message || "Đã xảy ra lỗi khi lấy danh sách lịch làm việc",
      });
    }
  }

  async getWorkScheduleById(req, res) {
    try {
      const workSchedule = await workScheduleService.getWorkScheduleById(
        req.params.id
      );
      res.json({
        success: true,
        message: "Lấy thông tin lịch làm việc thành công",
        data: workSchedule,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message:
          error.message || "Đã xảy ra lỗi khi lấy thông tin lịch làm việc",
      });
    }
  }

  async updateWorkSchedule(req, res) {
    try {
      const workSchedule = await workScheduleService.updateWorkSchedule(
        req.params.id,
        req.body
      );
      res.json({
        success: true,
        message: "Cập nhật lịch làm việc thành công",
        data: workSchedule,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi cập nhật lịch làm việc",
      });
    }
  }

  async deleteWorkSchedule(req, res) {
    try {
      const result = await workScheduleService.deleteWorkSchedule(
        req.params.id
      );
      res.json({
        success: true,
        message: "Xóa lịch làm việc thành công",
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Đã xảy ra lỗi khi xóa lịch làm việc",
      });
    }
  }
}

module.exports = new WorkScheduleController();
