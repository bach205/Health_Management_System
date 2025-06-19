const express = require("express");
const router = express.Router();
const ExaminationOrderController = require("../controllers/examinationOrder.controller");
const asyncHandler = require("../helper/asyncHandler");
const validate = require("../middlewares/validate");
const { examinationOrderSchema } = require("../validators/examination.validator");

router.post("/", validate({ body: examinationOrderSchema }), asyncHandler(ExaminationOrderController.create));
router.get("/:id", asyncHandler(ExaminationOrderController.getById));
router.get("/", asyncHandler(ExaminationOrderController.getAll));
router.get("/patient/:id", asyncHandler(ExaminationOrderController.getPatientExaminationOrder));

// Tạo yêu cầu chuyển phòng
router.post("/", ExaminationOrderController.create);

module.exports = router; 