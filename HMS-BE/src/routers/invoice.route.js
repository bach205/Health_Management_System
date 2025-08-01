// payment.routes.js
const express = require("express");
const asyncHandler = require('../helper/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');
const invoiceController = require("../controllers/invoice.controller");

const invoiceRouter = express.Router();
invoiceRouter.use(authenticate);


invoiceRouter.get("/", asyncHandler(invoiceController.getInvoiceList));
invoiceRouter.get("/:record_id", asyncHandler(invoiceController.getInvoiceDetail));
invoiceRouter.get("/appointment/:id", asyncHandler(invoiceController.getInvoiceByAppointmentId));
invoiceRouter.patch("/:record_id", authorize('admin', 'nurse'), asyncHandler(invoiceController.updateInvoice));

module.exports = invoiceRouter;