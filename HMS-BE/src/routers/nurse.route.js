const express = require("express");
const nurseRouter = express.Router();
const NurseController = require("../controllers/nurse.controller");
const checkUserStatus = require("../middlewares/checkUserStatus");
const { authenticate, authorize } = require("../middlewares/auth");

// Apply middleware to all routes
nurseRouter.use(authenticate);
nurseRouter.use(checkUserStatus());


// Routes that require admin authorization
nurseRouter.post("/create",
    authenticate,
    authorize("admin"),
    async (req, res) => {
        return await NurseController.createNurse(req, res);
    });

nurseRouter.put("/update/:id",
    authenticate,
    authorize("admin"),
    async (req, res) => {
        return await NurseController.updateNurse(req, res);
    });

nurseRouter.put("/ban/:id",
    authenticate,
    authorize("admin"),
    async (req, res) => {
        return await NurseController.banNurse(req, res);
    });

nurseRouter.put("/reset-password/:id",
    authenticate,
    authorize("admin"),
    async (req, res) => {
        return await NurseController.resetPassword(req, res);
    });

// Routes that allow both admin and staff to access
nurseRouter.get("/get-all-nurse",
    authenticate,
    authorize("admin", "doctor", "nurse"),
    async (req, res) => {
        return await NurseController.getAllNurse(req, res);
    });

nurseRouter.delete("/delete/:id",
    authenticate,
    authorize("admin"),
    async (req, res) => {
        return await NurseController.deleteNurse(req, res);
    });

    // CSV
nurseRouter.post(
    "/create-nurses-from-csv",
    authenticate,
    authorize("admin"),
    async (req, res) => {
        return await NurseController.createNursesFromCSV(req, res);
    });

module.exports = nurseRouter; 