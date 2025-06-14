const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointment.controller");

router.get("/all", appointmentController.getAllAppointments);
router.post("/book", appointmentController.bookAppointment);
router.post("/nurse-book", appointmentController.nurseBookAppointment);
router.get("/slots", appointmentController.getAvailableSlots);
router.get("/patient/:id", appointmentController.getPatientAppointments);
router.post("/confirm", appointmentController.confirmAppointment);
router.post("/cancel", appointmentController.cancelAppointment);

module.exports = router;
