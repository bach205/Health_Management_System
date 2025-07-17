// payment.routes.js
const express = require("express");
const asyncHandler = require('../helper/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const invoiceController = require("../controllers/invoice.controller");

const invoiceRouter = express.Router();

invoiceRouter.get("/", asyncHandler(invoiceController.getInvoiceList));
invoiceRouter.get("/:record_id", asyncHandler(invoiceController.getInvoiceDetail));

module.exports = invoiceRouter;