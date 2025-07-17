const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  createDoctorSchema,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const doctorRouter = express.Router();
const checkUserStatus = require("../middlewares/checkUserStatus");

// Apply middleware to all routes
// doctorRouter.use(authenticate);  

// doctorRouter.use(checkUserStatus());

doctorRouter.post(
  "/create",
  authenticate,
  checkUserStatus(),
  authorize("admin"),
  // validate({ body: createDoctorSchema }),
  asyncHandler(doctorController.createDoctor),
  doctorController.createDoctor
);

doctorRouter.post(
  "/",
  // authenticate,
  //  authorize("admin"),
  asyncHandler(doctorController.getDoctors),
  doctorController.getDoctors
);

doctorRouter.get(
  "/",
  authenticate,
  checkUserStatus(),
  authorize("admin"),
  asyncHandler(doctorController.getAllDoctors),
  doctorController.getAllDoctors
);

doctorRouter.post(
  "/update",
  authenticate,
  checkUserStatus(),
  authorize("admin"),
  asyncHandler(doctorController.updateDoctor),
  doctorController.updateDoctor
);

doctorRouter.post(
  "/update-status",
  authenticate,
  authorize("admin"),
  checkUserStatus(),
  asyncHandler(doctorController.changeActive),
  doctorController.changeActive
);

doctorRouter.post(
  "/update-password",
  authenticate,
  authorize("admin"),
  checkUserStatus(),
  asyncHandler(doctorController.updatePassword),
  doctorController.updatePassword
);

doctorRouter.get(
  "/:id",
  // authenticate,
  // authorize("admin"),
  asyncHandler(doctorController.getDoctorById),
  doctorController.getDoctorById
);

doctorRouter.get(
  "/clinic/:clinicId",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor"),
  asyncHandler(doctorController.getDoctorsInClinic),
  doctorController.getDoctorsInClinic
);

doctorRouter.get(
  "/available-slots/:doctorId",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor"),
  asyncHandler(doctorController.getDoctorAvailableSlots),
  doctorController.getDoctorAvailableSlots
);

doctorRouter.post(
  "/update-info",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor"),
  asyncHandler(doctorController.updateDoctorInfo),
  doctorController.updateDoctorInfo
);

doctorRouter.post(
  "/update-staff-info",
  authenticate,
  checkUserStatus(),
  authorize("admin", "doctor", "nurse"),
  asyncHandler(doctorController.updateStaffInfo),
  doctorController.updateStaffInfo
);

doctorRouter.post(
  "/create-doctors-from-csv",
  authenticate,
  checkUserStatus(),
  authorize("admin"),
  asyncHandler(doctorController.createDoctorsFromCSV),
  doctorController.createDoctorsFromCSV
);

doctorRouter.get(
  "/nearest-slot/:clinicId",
  // authenticate,
  // checkUserStatus(),
  // authorize("admin", "doctor"),
  asyncHandler(doctorController.getAvailableDoctorsWithNearestSlot),
  doctorController.getAvailableDoctorsWithNearestSlot
);

doctorRouter.post(
  "/all/with-rating",
  asyncHandler(doctorController.getAllDoctorsWithAvgRating),
  doctorController.getAllDoctorsWithAvgRating
);

// Ví dụ check authen bên trong router
// authRouter.get("/users", authenticateToken, authorizeRoles("admin"), asyncHandler(AuthController.getUsers));

module.exports = doctorRouter;
