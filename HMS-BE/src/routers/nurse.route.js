const express = require("express");
const nurseRouter = express.Router();
const NurseController = require("../controllers/nurse.controller");
nurseRouter.post("/create", async (req, res) => {
    return await NurseController.createNurse(req, res);
});
nurseRouter.post("/update/:id", async (req, res) => {
    return await NurseController.updateNurse(req, res);
});
nurseRouter.post("/ban/:id", async (req, res) => {
    return await NurseController.banNurse(req, res);
});


module.exports = nurseRouter; 