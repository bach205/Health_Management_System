const express = require("express");
const router = express.Router();
const authRouter = require("./auth.route");
const nurseRouter = require("./nurse.route");
const doctorRouter = require("./doctor.route");
const clinicRouter = require("./clinic.route");
const workScheduleRouter = require("./work-schedule.route");
const shiftRouter = require("./shift.route");

router.use("/auth", authRouter);
router.use("/clinic", clinicRouter);
router.use("/work-schedules", workScheduleRouter);
router.use("/nurses", nurseRouter);
router.use("/doctors", doctorRouter);
router.use("/shifts", shiftRouter);

module.exports = router;
