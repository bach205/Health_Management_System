const QueueService = require("../services/queue.service");
const { OK } = require("../core/success.response");

class QueueController {
  /**
   * Lấy danh sách queue của phòng khám
   */
  static async getQueueClinic(req, res, next) {
    try {
      const { clinicId } = req.params;
      const { pageNumber, pageSize, type } = req.query;
      const result = await QueueService.getQueueClinic(clinicId, {
        pageNumber,
        pageSize,
        type,
      });
      return new OK({
        message: "Lấy danh sách queue thành công",
        metadata: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Chỉ định thêm phòng khám cho bệnh nhân
   */
  static async assignAdditionalClinic(req, res, next) {
    try {
      const { patient_id, to_clinic_id, record_id, priority, reason, note } = req.body;
      const queue = await QueueService.assignAdditionalClinic({
        patient_id,
        to_clinic_id,
        record_id,
        priority,
        reason,
        note
      });
      return new OK({
        message: "Chỉ định phòng khám thành công",
        metadata: queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật trạng thái queue
   */
  static async updateQueueStatus(req, res, next) {
    try {
      const { queueId } = req.params;
      const { status } = req.body;
      const queue = await QueueService.updateQueueStatus(queueId, status);
      return new OK({
        message: "Cập nhật trạng thái queue thành công",
        metadata: queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check-in vào queue từ appointment
   */
  static async checkInFromAppointment(req, res, next) {
    try {
      const { appointment_id } = req.body;
      const queue = await QueueService.checkInFromAppointment({
        appointment_id,
      });
      return new OK({
        message: "Check-in vào hàng đợi thành công",
        metadata: queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hủy queue khi hủy appointment
   */
  static async cancelQueueByAppointment(req, res, next) {
    try {
      const { appointment_id } = req.body;
      const queue = await QueueService.cancelQueueByAppointment({
        appointment_id,
      });
      return new OK({
        message: "Hủy queue thành công",
        metadata: queue,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gọi số tiếp theo
   */
  static async callNextPatient(req, res, next) {
    try {
      const { clinic_id } = req.body;
      const { queueClinic } = await QueueService.getQueueClinic(clinic_id, {
        pageNumber: 1,
        pageSize: 1,
      });
      const nextQueue = queueClinic[0];
      if (!nextQueue) {
        return res.status(404).json({
          success: false,
          message: "Không còn bệnh nhân trong hàng đợi",
        });
      }
      const updated = await QueueService.updateQueueStatus(
        nextQueue.id,
        "in_progress"
      );
      return new OK({
        message: "Đã gọi số tiếp theo",
        metadata: updated,
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  // Đánh dấu vắng mặt (skipped)
  static async skipPatient(req, res, next) {
    try {
      const { queue_id } = req.body;
      const updated = await QueueService.updateQueueStatus(queue_id, "skipped");
      return res.json({ message: "Đã đánh dấu vắng mặt", queue: updated });
    } catch (error) {
      next(error);
    }
  }

  // Đánh dấu đã khám xong (done)
  static async finishPatient(req, res, next) {
    try {
      const { queue_id } = req.body;
      const updated = await QueueService.updateQueueStatus(queue_id, "done");
      return res.json({ message: "Đã hoàn thành khám", queue: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách queue của tất cả bệnh nhân theo ngày (truyền ?date=YYYY-MM-DD)
   */
  static async getTodayQueues(req, res, next) {
    try {
      const { date } = req.query;
      const queues = await QueueService.getQueuesByDate(date);
      return new OK({
        message: "Lấy danh sách queue theo ngày thành công",
        metadata: queues
      }).send(res);
    } catch (error) {
      next(error);
    }
  }

  static async assignClinic(req, res) {
    const result = await QueueService.createOrderAndAssignToDoctorQueue(req.body);
    return new OK({
      message: "Chuyển phòng và thêm vào hàng đợi thành công",
      metadata: result
    }).send(res)
  }

}

module.exports = QueueController;
