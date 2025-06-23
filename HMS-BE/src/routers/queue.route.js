const express = require("express");
const queueRouter = express.Router();
const QueueController = require("../controllers/queue.controller");
const asyncHandler = require("../helper/asyncHandler");

const { authenticate, authorize } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");

// Lấy danh sách queue của phòng khám
queueRouter.get("/clinic/:clinicId",
  authenticate,
  authorize("admin", "doctor", "patient", "nurse"),
  checkUserStatus(),
  asyncHandler(QueueController.getQueueClinic));

// Chỉ định thêm phòng khám cho bệnh nhân
queueRouter.post(
  "/assign-clinic",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.assignAdditionalClinic)
);

// Cập nhật trạng thái queue
queueRouter.patch(
  "/:queueId/status",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.updateQueueStatus)
);

// Check-in vào queue từ appointment
queueRouter.post(
  "/checkin",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.checkInFromAppointment)
);

// Hủy queue khi hủy appointment
queueRouter.post(
  "/cancel",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.cancelQueueByAppointment)
);

// Gọi số tiếp theo
queueRouter.post(
  "/call-next",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.callNextPatient)
);

module.exports = queueRouter;
