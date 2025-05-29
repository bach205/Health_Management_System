const express = require("express");
const router = express.Router();
const authRouter = require("./auth.route");
const clinicRouter = require("./clinic.route");
const workScheduleRouter = require("./work-schedule.route");
const shiftRouter = require("./shift.route");
const nurseRouter = require("./nurse.route");
const doctorRouter = require("./doctor.route");

router.use("/nurse", nurseRouter);
router.use("/doctor", doctorRouter);
router.use("/auth", authRouter);
router.use("/clinic", clinicRouter);
router.use("/work-schedules", workScheduleRouter);
router.use("/shifts", shiftRouter);

module.exports = router;
