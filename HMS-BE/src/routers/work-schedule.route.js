const express = require("express");
const workScheduleController = require("../controllers/work-schedule.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
} = require("../validators/work-schedule.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");

const workScheduleRouter = express.Router();

// Apply middleware to all routes
// workScheduleRouter.use(checkUserStatus);

// Get all work schedules (admin, doctor, nurse)
workScheduleRouter.get(
  "/",
  authenticate,
  authorize("admin", "doctor", "nurse"),
  asyncHandler(workScheduleController.getWorkSchedules)
);

// Get work schedule by ID (admin, doctor, nurse)
workScheduleRouter.get(
  "/:id",
  authenticate,
  authorize("admin", "doctor", "nurse"),
  asyncHandler(workScheduleController.getWorkScheduleById)
);

// Create work schedule (admin only)
workScheduleRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  validate({ body: createWorkScheduleSchema }),
  asyncHandler(workScheduleController.createWorkSchedule)
);

// Update work schedule (admin only)
workScheduleRouter.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate({ body: updateWorkScheduleSchema }),
  asyncHandler(workScheduleController.updateWorkSchedule)
);

// Delete work schedule (admin only)
workScheduleRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(workScheduleController.deleteWorkSchedule)
);

module.exports = workScheduleRouter;
