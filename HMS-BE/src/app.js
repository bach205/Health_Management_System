const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const router = require("./routers");
const { globalErrorHandler } = require("./middlewares/errorHandler");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/v1", router);

// Error handler
app.use(globalErrorHandler);

module.exports = app;
