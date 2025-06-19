const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  createDoctorSchema,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const doctorRouter = express.Router();

doctorRouter.post(
  "/create",
  authenticate,
  authorize("admin"),
  // validate({ body: createDoctorSchema }),
  asyncHandler(doctorController.createDoctor),
  doctorController.createDoctor
);

doctorRouter.post(
  "/",
  authenticate,
  // authorize("admin"),
  asyncHandler(doctorController.getDoctors),
  doctorController.getDoctors
);

doctorRouter.get(
  "/",
  authenticate,
  authorize("admin"),
  asyncHandler(doctorController.getAllDoctors),
  doctorController.getAllDoctors
);

doctorRouter.post(
  "/update",
  authenticate,
  authorize("admin"),
  asyncHandler(doctorController.updateDoctor),
  doctorController.updateDoctor
);

doctorRouter.post(
  "/update-status",
  authenticate,
  authorize("admin"),
  asyncHandler(doctorController.changeActive),
  doctorController.changeActive
);

doctorRouter.post(
  "/update-password",
  authenticate,
  authorize("admin"),
  asyncHandler(doctorController.updatePassword),
  doctorController.updatePassword
);

doctorRouter.get(
  "/:id",
  authenticate,
  authorize("admin", "doctor"),
  asyncHandler(doctorController.getDoctorById),
  doctorController.getDoctorById
);

doctorRouter.get(
  "/clinic/:clinicId",
  authenticate,
  authorize("admin", "doctor"),
  asyncHandler(doctorController.getDoctorsInClinic),
  doctorController.getDoctorsInClinic
);

doctorRouter.get(
  "/available-slots/:doctorId",
  authenticate,
  authorize("admin", "doctor"),
  asyncHandler(doctorController.getDoctorAvailableSlots),
  doctorController.getDoctorAvailableSlots
);

doctorRouter.post(
  "/update-info",
  authenticate,
  authorize("admin", "doctor"),
  asyncHandler(doctorController.updateDoctorInfo),
  doctorController.updateDoctorInfo
);

doctorRouter.post(
  "/update-staff-info",
  authenticate,
  authorize("admin", "doctor", "nurse"),
  asyncHandler(doctorController.updateStaffInfo),
  doctorController.updateStaffInfo
);

// Ví dụ check authen bên trong router
// authRouter.get("/users", authenticateToken, authorizeRoles("admin"), asyncHandler(AuthController.getUsers));

module.exports = doctorRouter;
