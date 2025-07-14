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
router.get("/slots-by-specialty", appointmentController.getAvailableSlotsBySpecialty);
router.post("/nurse/reschedule", appointmentController.nurseRescheduleAppointment);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);
module.exports = router;
