const express = require("express");
const queueRouter = express.Router();

queueRouter.get("/queue-room", async (req, res) => {
    res.status(200).json({ message: "Hello World" });
});

module.exports = queueRouter;
