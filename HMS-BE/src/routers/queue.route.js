const express = require("express");
const queueRouter = express.Router();
const QueueController = require("../controllers/queue.controller");
const asyncHandler = require("../helper/asyncHandler");


// Lấy danh sách queue của phòng khám
queueRouter.get("/clinic/:clinicId", asyncHandler(QueueController.getQueueClinic));

// Chỉ định thêm phòng khám cho bệnh nhân
queueRouter.post(
  "/assign-clinic",
  asyncHandler(QueueController.assignAdditionalClinic)
);

// Cập nhật trạng thái queue
queueRouter.patch(
  "/:queueId/status",
  asyncHandler(QueueController.updateQueueStatus)
);

// Check-in vào queue từ appointment
queueRouter.post(
  "/checkin",
  asyncHandler(QueueController.checkInFromAppointment)
);

// Hủy queue khi hủy appointment
queueRouter.post(
  "/cancel",
  asyncHandler(QueueController.cancelQueueByAppointment)
);

// Gọi số tiếp theo
queueRouter.post(
  "/call-next",
  asyncHandler(QueueController.callNextPatient)
);

module.exports = queueRouter;
