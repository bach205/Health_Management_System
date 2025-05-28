const express = require("express");
const ClinicController = require("../controllers/clinic.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  createClinicSchema,
  updateClinicSchema,
} = require("../validators/clinic.validator");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");

const clinicRouter = express.Router();

// Public routes
clinicRouter.get("/", asyncHandler(ClinicController.getAllClinics));
clinicRouter.get("/:id", asyncHandler(ClinicController.getClinicById));

// Protected routes (admin only)
clinicRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  validate({ body: createClinicSchema }),
  asyncHandler(ClinicController.createClinic)
);

clinicRouter.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate({ body: updateClinicSchema }),
  asyncHandler(ClinicController.updateClinic)
);

clinicRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  asyncHandler(ClinicController.deleteClinic)
);

module.exports = clinicRouter;
