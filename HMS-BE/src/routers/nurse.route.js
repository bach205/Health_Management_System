const express = require("express");
const nurseRouter = express.Router();
const NurseController = require("../controllers/nurse.controller");
nurseRouter.post("/create", async (req, res) => {
    return await NurseController.createNurse(req, res);
});
nurseRouter.put("/update/:id", async (req, res) => {
    return await NurseController.updateNurse(req, res);
});
nurseRouter.put("/ban/:id", async (req, res) => {
    return await NurseController.banNurse(req, res);
});
nurseRouter.get("/", async (req, res) => {
    return await NurseController.getAllNurse(req, res);
})
nurseRouter.put("/reset-password/:id", NurseController.resetPassword);


module.exports = nurseRouter; 