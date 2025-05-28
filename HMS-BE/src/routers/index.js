const express = require("express");
const router = express.Router();
const authRouter = require("./auth.route");
const nurseRouter = require("./nurse.route");
const doctorRouter = require("./doctor.route");

router.use("/auth", authRouter);
router.use("/nurse", nurseRouter);
router.use("/doctor", doctorRouter);

module.exports = router;