const express = require("express");
const router = express.Router();
const authRouter = require("./auth.route");
const nurseRouter = require("./nurse.route");

router.use("/auth", authRouter);
router.use("/nurse", nurseRouter);

module.exports = router;