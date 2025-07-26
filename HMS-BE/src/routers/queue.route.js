const express = require("express");
const queueRouter = express.Router();
const QueueController = require("../controllers/queue.controller");
const asyncHandler = require("../helper/asyncHandler");

const { authenticate, authorize } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");

// Lấy danh sách queue của phòng khám
queueRouter.get("/clinic/:clinicId",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "patient", "nurse"),
  asyncHandler(QueueController.getQueueClinic));

// Chỉ định thêm phòng khám cho bệnh nhân
// queueRouter.post(
//   "/assign-clinic",
//   authenticate,
//   checkUserStatus(),
//   authorize("admin", "doctor", "nurse"),
//   asyncHandler(QueueController.assignAdditionalClinic)
// );

// Cập nhật trạng thái queue
queueRouter.patch(
  "/:queueId/status",
  // authenticate,
  // checkUserStatus(),
  // authorize("admin", "doctor", "nurse"),
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

// Lấy số theo clinic_id
queueRouter.get(
  "/get_queue_number",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.GetAllQueuesNumberByClinicId)
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

// Lấy danh sách queue của tất cả bệnh nhân trong ngày hôm nay
queueRouter.get(
  "/today",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.getTodayQueues)
);

queueRouter.post(
  "/assign-clinic",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(QueueController.assignClinic)
);

module.exports = queueRouter;
