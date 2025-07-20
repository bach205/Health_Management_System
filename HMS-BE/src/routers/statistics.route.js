const express = require("express");
const asyncHandler = require("../helper/asyncHandler");
const validate = require("../middlewares/validate");
const { authenticate, authorize } = require("../middlewares/auth");
const statisticsRouter = express.Router();
const checkUserStatus = require("../middlewares/checkUserStatus");
const statisticsController = require("../controllers/statistics.controller");

// Apply middleware to all routes
statisticsRouter.use(authenticate);  
statisticsRouter.use(checkUserStatus());
statisticsRouter.get(
  "/top-doctors",
  authorize("admin"),
  asyncHandler(statisticsController.getTopDoctors),
  statisticsController.getTopDoctors
);

statisticsRouter.get(
  "/period-statistics",
  // authenticate,
  // checkUserStatus(),
  authorize("admin"),
  asyncHandler(statisticsController.getPeriodStatistics),
  statisticsController.getPeriodStatistics
);

statisticsRouter.get(
  "/revenue-days",
  // authenticate,
  // checkUserStatus(),
  authorize("admin"),
  // validate("getRevenuePerDayInMonth"),
  asyncHandler(statisticsController.getRevenuePerDayInMonth),
  statisticsController.getRevenuePerDayInMonth
);

statisticsRouter.get(
  "/revenue-months",
  // authenticate,
  // checkUserStatus(),
  authorize("admin"),
  // validate("getRevenuePerMonthInYear"),
  asyncHandler(statisticsController.getRevenuePerMonthInYear),
  statisticsController.getRevenuePerMonthInYear
);

statisticsRouter.get(
  "/total-statistics",
  // authenticate,
  // checkUserStatus(),
  authorize("admin"),
  asyncHandler(statisticsController.getTotalStatistics),
  statisticsController.getTotalStatistics
);
module.exports = statisticsRouter;
