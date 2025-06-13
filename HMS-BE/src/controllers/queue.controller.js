const { OK } = require("../core/success.response");
const QueueService = require("../services/queue.service");

class QueueController {
  static async getQueueClinic(req, res, next) {
    console.log("req", req);
    try {
      const clinicId = req.params.clinicId;
      const result = await QueueService.getQueueClinic(clinicId, req.query);
      return new OK({
        message: "Lấy danh sách hàng đợi thành công",
        ...result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  static async assignAdditionalClinic(req, res, next) {
    try {
      const queue = await QueueService.assignAdditionalClinic(req.body);
      return new OK({
        message: "Gán thêm phòng khám thành công",
        queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  static async updateQueueStatus(req, res, next) {
    try {
      const { queueId } = req.params;
      const { status } = req.body;
      const queue = await QueueService.updateQueueStatus(queueId, status);
      return new OK({
        message: "Cập nhật trạng thái hàng đợi thành công",
        queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
  static async getQueueRoom(req, res) {
    return new OK({
      message: "Get queue room successfully",
      queues: [],
    }).send(res);
  }

  // BỔ SUNG THÊM LOGIC: Check-in vào queue từ appointment
  static async checkInFromAppointment(req, res, next) {
    try {
      const { appointment_id } = req.body;
      const queue = await QueueService.checkInFromAppointment({
        appointment_id,
      });
      return new OK({
        message: "Check-in vào hàng đợi thành công",
        queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  // BỔ SUNG THÊM LOGIC: Huỷ queue khi huỷ appointment
  static async cancelQueueByAppointment(req, res, next) {
    try {
      const { appointment_id } = req.body;
      const queue = await QueueService.cancelQueueByAppointment({
        appointment_id,
      });
      return new OK({
        message: "Huỷ queue liên kết với appointment thành công",
        queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QueueController;
