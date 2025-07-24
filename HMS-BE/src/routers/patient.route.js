const express = require("express");
const patientController = require("../controllers/patient.controller");
const asyncHandler = require("../helper/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createPatientSchema } = require("../validators/auth.validator");
const checkUserStatus = require("../middlewares/checkUserStatus");

const patientRouter = express.Router();

// Apply middleware to all routes
patientRouter.use(authenticate);
patientRouter.use(checkUserStatus());

// Create new patient (Admin, Receptionist only)
patientRouter.post(
    "/create",
    authenticate,
    authorize("admin", "nurse"),
    validate({ body: createPatientSchema }),
    asyncHandler(patientController.createPatient)
);

// Get patients with filters (Admin, , Receptionist)
patientRouter.post(
    "/",
    authenticate,
    authorize("admin", "nurse"),
    asyncHandler(patientController.getPatients)
);

// Get all patients (Admin, , Receptionist)
patientRouter.get(
    "/",
    authenticate,
    authorize("admin", "nurse"),
    asyncHandler(patientController.getAllPatients)
);

// Update patient (Admin, Receptionist)
patientRouter.post(
    "/update",
    authenticate,
    authorize("admin", "nurse"),
    asyncHandler(patientController.updatePatient)
);

// Update patient status (Admin only)
patientRouter.post(
    "/update-status",
    authenticate,
    authorize("admin", "nurse"),
    asyncHandler(patientController.changeActive)
);

// Reset patient password (Admin only)
patientRouter.post(
    "/update-password",
    authenticate,
    authorize("admin", "nurse"),
    asyncHandler(patientController.updatePassword)
);

// Get patient by ID (Admin)
patientRouter.get(
    "/:id",
    authenticate,
    authorize("admin", "nurse"),
    asyncHandler(patientController.getPatientById)
);

// Lấy bệnh nhân và hồ sơ khám gần nhất có đơn thuốc theo số CCCD (nurse)
patientRouter.post(
    "/find-by-cccd",
    // authenticate,
    // authorize("nurse"),
    asyncHandler(patientController.getPatientByIdentityNumber)
);

module.exports = patientRouter; 