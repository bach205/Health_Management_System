const express = require("express");
const nurseRouter = express.Router();
const NurseController = require("../controllers/nurse.controller");
nurseRouter.post("/create", async (req, res) => {
    return await NurseController.createNurse(req, res);
});
nurseRouter.post("/update/:id", async (req, res) => {
    return await NurseController.updateNurse(req, res);
});


module.exports = nurseRouter; 