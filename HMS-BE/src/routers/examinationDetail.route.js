const express = require("express");
const router = express.Router();
const ExaminationDetailController = require("../controllers/examinationDetail.controller");
const asyncHandler = require("../helper/asyncHandler");
const validate = require("../middlewares/validate");
const { examinationDetailSchema } = require("../validators/examination.validator");

// API này chỉ tạo kết quả khám, không điều phối, không tạo queue mới
router.post("/", validate({ body: examinationDetailSchema }), asyncHandler(ExaminationDetailController.create));
router.put("/:id", asyncHandler(ExaminationDetailController.update));
router.get("/:id", asyncHandler(ExaminationDetailController.getById));
router.get("/", asyncHandler(ExaminationDetailController.getAll));

module.exports = router; 