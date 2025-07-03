const express = require("express");
const asyncHandler = require("../helper/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");
const medicineController = require("../controllers/medicine.controller");

const medicineRouter = express.Router();

medicineRouter.use(authenticate);
// medicineRouter.use(checkUserStatus());

medicineRouter.get(
    "/",
    authorize("admin"),
    asyncHandler(medicineController.getAllMedicines)
);

medicineRouter.get(
    "/:id",
    authorize("admin"),
    asyncHandler(medicineController.getMedicineById)
);
medicineRouter.post(
    "/",
    authorize("admin"),
    asyncHandler(medicineController.getMedicines)
);


medicineRouter.post(
    "/create",
    authorize("admin"),
    asyncHandler(medicineController.createMedicine)
);

medicineRouter.post(
    "/update/:id",
    authorize("admin"),
    asyncHandler(medicineController.updateMedicine)
);

medicineRouter.delete(
    "/delete/:id",
    authorize("admin"),
    asyncHandler(medicineController.deleteMedicine)
);

module.exports = medicineRouter;
