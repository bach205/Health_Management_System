const express = require("express");
const router = express.Router();
const authRouter = require("./auth.route");
const clinicRouter = require("./clinic.route");
const workScheduleRouter = require("./work-schedule.route");
const shiftRouter = require("./shift.route");

router.use("/auth", authRouter);
router.use("/clinic", clinicRouter);
router.use("/work-schedules", workScheduleRouter);
router.use("/shifts", shiftRouter);

module.exports = router;
