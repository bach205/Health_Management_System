const express = require("express");
const queueRouter = express.Router();
const { authenticate } = require("../middlewares/authenticate");
const QueueController = require("../controllers/queue.controller");
const asyncHandler = require("../helper/asyncHandler");

// queueRouter.use(authenticate);
queueRouter.get("/:clinicId", asyncHandler(QueueController.getQueueClinic));
queueRouter.post(
  "/queue-clinic/assign",
  asyncHandler(QueueController.assignAdditionalClinic)
);
queueRouter.patch(
  "/:queueId/status",
  asyncHandler(QueueController.updateQueueStatus)
);

module.exports = queueRouter;
