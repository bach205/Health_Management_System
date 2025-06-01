const express = require("express");
const router = express.Router();
const ExaminationRecordController = require("../controllers/examinationRecord.controller");
const asyncHandler = require("../helper/asyncHandler");
const validate = require("../middlewares/validate");
const { examinationRecordSchema } = require("../validators/examination.validator");

router.post("/", validate({ body: examinationRecordSchema }), asyncHandler(ExaminationRecordController.create));
router.put("/:id", asyncHandler(ExaminationRecordController.update));
router.get("/:id", asyncHandler(ExaminationRecordController.getById));
router.get("/", asyncHandler(ExaminationRecordController.getAll));

module.exports = router; 