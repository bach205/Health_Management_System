const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");

router.post("/book", appointmentController.bookAppointment);
router.get("/slots", appointmentController.getAvailableSlots);
router.get("/patient/:id", appointmentController.getPatientAppointments);
router.post("/confirm", appointmentController.confirmAppointment);
router.post("/cancel", appointmentController.cancelAppointment);
router.get("/detail", appointmentController.getAppointmentDetail);

module.exports = router;
