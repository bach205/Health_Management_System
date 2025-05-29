const express = require("express");
const shiftController = require("../controllers/shift.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  createShiftSchema,
  updateShiftSchema,
} = require("../validators/shift.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");

const shiftRouter = express.Router();

// Get all shifts (admin, doctor, nurse)
shiftRouter.get(
  "/",
  authenticate,
  // authorize(["admin", "doctor", "nurse"]),
  asyncHandler(shiftController.getShifts)
);

// Get shift by ID (admin, doctor, nurse)
shiftRouter.get(
  "/:id",
  authenticate,
  // authorize(["admin", "doctor", "nurse"]),
  asyncHandler(shiftController.getShiftById)
);

// Create shift (admin only)
shiftRouter.post(
  "/",
  authenticate,
  // authorize(["admin"]),
  validate({ body: createShiftSchema }),
  asyncHandler(shiftController.createShift)
);

// Update shift (admin only)
shiftRouter.put(
  "/:id",
  authenticate,
  // authorize(["admin"]),
  validate({ body: updateShiftSchema }),
  asyncHandler(shiftController.updateShift)
);

// Delete shift (admin only)
shiftRouter.delete(
  "/:id",
  authenticate,
  // authorize(["admin"]),
  asyncHandler(shiftController.deleteShift)
);

module.exports = shiftRouter;
