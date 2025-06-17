const express = require("express");
const patientController = require("../controllers/patient.controller");
const asyncHandler = require("../helper/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createPatientSchema } = require("../validators/auth.validator");

const patientRouter = express.Router();

// Create new patient (Admin, Receptionist only)
patientRouter.post(
    "/create",
    // authenticate,
    // authorize(["admin", "receptionist"]),
    validate({ body: createPatientSchema }),
    asyncHandler(patientController.createPatient)
);

// Get patients with filters (Admin, Doctor, Receptionist)
patientRouter.post(
    "/",
    // authenticate,
    // authorize(["admin", "doctor", "receptionist"]),
    asyncHandler(patientController.getPatients)
);

// Get all patients (Admin, Doctor, Receptionist)
patientRouter.get(
    "/",
    // authenticate,
    // authorize(["admin", "doctor", "receptionist"]),
    asyncHandler(patientController.getAllPatients)
);

// Update patient (Admin, Receptionist)
patientRouter.post(
    "/update",
    // authenticate,
    // authorize(["admin", "receptionist"]),
    asyncHandler(patientController.updatePatient)
);

// Update patient status (Admin only)
patientRouter.post(
    "/update-status",
    // authenticate,
    // authorize(["admin"]),
    asyncHandler(patientController.changeActive)
);

// Reset patient password (Admin only)
patientRouter.post(
    "/update-password",
    // authenticate,
    // authorize(["admin"]),
    asyncHandler(patientController.updatePassword)
);

// Get patient by ID (Admin, Doctor, Receptionist)
patientRouter.get(
    "/:id",
    // authenticate,
    // authorize(["admin", "doctor", "receptionist"]),
    asyncHandler(patientController.getPatientById)
);

module.exports = patientRouter; 