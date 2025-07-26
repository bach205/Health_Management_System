const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const router = require("./routers");
const { globalErrorHandler } = require("./middlewares/errorHandler");
const tagRouter = require('./routers/tag.route');


// ✅ Đúng: middleware phải được đặt trước route
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://swp391-hms.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan("dev"));

// ✅ Sau khi có middleware mới được khai báo router
app.use("/api/v1/tag", tagRouter);
app.use("/api/v1", router);

// Error handler
app.use(globalErrorHandler);

module.exports = app;
