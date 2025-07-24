const express = require("express");
const asyncHandler = require("../helper/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");
const medicineController = require("../controllers/medicine.controller");

const medicineRouter = express.Router();

medicineRouter.use(authenticate);
medicineRouter.use(checkUserStatus());

medicineRouter.get(
    "/",
    authorize("admin", "doctor", "nurse"),
    asyncHandler(medicineController.getAllMedicines)
);

medicineRouter.get(
    "/:id",
    authorize("admin", "doctor", "nurse"),
    asyncHandler(medicineController.getMedicineById)
);
medicineRouter.post(
    "/",
    authorize("admin", "doctor", "nurse"),
    asyncHandler(medicineController.getMedicines)
);


medicineRouter.post(
    "/create",
    authorize("admin", "doctor", "nurse"),
    asyncHandler(medicineController.createMedicine)
);

medicineRouter.post(
    "/update/:id",
    authorize("admin", "nurse"),
    asyncHandler(medicineController.updateMedicine)
);

medicineRouter.delete(
    "/delete/:id",
    authorize("admin", "nurse"),
    asyncHandler(medicineController.deleteMedicine)
);

medicineRouter.post(
    "/sell",
    authorize("nurse"),
    asyncHandler(medicineController.sellMedicinesByRecord)
);

module.exports = medicineRouter;
