const { OK } = require("../core/success.response");
const QueueService = require("../services/queue.service");

class QueueController {
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
