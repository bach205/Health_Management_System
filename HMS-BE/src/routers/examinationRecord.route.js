const express = require("express");
const router = express.Router();
const ExaminationRecordController = require("../controllers/examinationRecord.controller");
const asyncHandler = require("../helper/asyncHandler");
const validate = require("../middlewares/validate");

router.post("/", asyncHandler(ExaminationRecordController.create));
router.put("/:id", asyncHandler(ExaminationRecordController.update));
router.get("/:id", asyncHandler(ExaminationRecordController.getById));
router.get("/appointment/:appointmentId", asyncHandler(ExaminationRecordController.getByAppointmentId));
router.get("/patient/:patientId/history", asyncHandler(ExaminationRecordController.getPatientExaminationHistory));
router.get("/", asyncHandler(ExaminationRecordController.getAll));

module.exports = router; 