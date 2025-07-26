const express = require("express");
const asyncHandler = require("../helper/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");
const specialtyController = require("../controllers/specialty.controller");

const specialtyRouter = express.Router();

// Middleware chung
// specialtyRouter.use(authenticate);
// specialtyRouter.use(checkUserStatus());

specialtyRouter.get(
  "/",
  // authorize("admin"),
  asyncHandler(specialtyController.getAllSpecialties)
);
specialtyRouter.post(
  "/",
  // authorize("admin"),
  asyncHandler(specialtyController.getSpecialties)
);

specialtyRouter.get(
  "/:id",
  // authorize("admin"),
  asyncHandler(specialtyController.getSpecialtyById)
);


// POST tạo mới chuyên khoa (admin)
specialtyRouter.post(
  "/create",
  authenticate,
  authorize("admin"),
  checkUserStatus(),
  asyncHandler(specialtyController.createSpecialty)
);

// POST cập nhật chuyên khoa theo ID (admin)
specialtyRouter.post(
  "/update/:id",
  authenticate,
  authorize("admin"),
  checkUserStatus(),
  asyncHandler(specialtyController.updateSpecialty)
);

// DELETE chuyên khoa (admin)
specialtyRouter.delete(
  "/delete/:id",
  authenticate,
  authorize("admin"),
  checkUserStatus(),
  asyncHandler(specialtyController.deleteSpecialty)
);

module.exports = specialtyRouter;
