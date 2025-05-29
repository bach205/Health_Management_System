const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  createDoctorSchema,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate");

const doctorRouter = express.Router();

doctorRouter.post(
  "/create",
  validate({ body: createDoctorSchema }),
  asyncHandler(doctorController.createDoctor),
  doctorController.createDoctor
);

doctorRouter.post(
  "/",
  asyncHandler(doctorController.getDoctors),
  doctorController.getDoctors
);

doctorRouter.get(
  "/",
  asyncHandler(doctorController.getAllDoctors),
  doctorController.getAllDoctors
);

doctorRouter.post(
  "/update",
  asyncHandler(doctorController.updateDoctor),
  doctorController.updateDoctor
);

doctorRouter.post(
  "/update-status",
  asyncHandler(doctorController.changeActive),
  doctorController.changeActive
);

doctorRouter.post(
  "/update-password",
  asyncHandler(doctorController.updatePassword),
  doctorController.updatePassword
);



// Ví dụ check authen bên trong router
// authRouter.get("/users", authenticateToken, authorizeRoles("admin"), asyncHandler(AuthController.getUsers));

module.exports = doctorRouter;
