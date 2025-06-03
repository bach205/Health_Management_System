const Joi = require("joi");

const bookAppointmentSchema = Joi.object({
  patient_id: Joi.number().integer().required(),
  doctor_id: Joi.number().integer().required(),
  clinic_id: Joi.number().integer().required(),
  appointment_date: Joi.date().iso().required(),
  appointment_time: Joi.string()
    .pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required(),
  reason: Joi.string().max(255).allow("", null),
  note: Joi.string().max(255).allow("", null),
});

const getAvailableSlotsSchema = Joi.object({
  doctor_id: Joi.number().integer().required(),
  clinic_id: Joi.number().integer().required(),
  appointment_date: Joi.date().iso().required(),
});

const getPatientAppointmentsSchema = Joi.object({
  patient_id: Joi.number().integer().required(),
});

const confirmAppointmentSchema = Joi.object({
  appointment_id: Joi.number().integer().required(),
});

const cancelAppointmentSchema = Joi.object({
  appointment_id: Joi.number().integer().required(),
  reason: Joi.string().max(255).allow("", null),
});

const getAppointmentDetailSchema = Joi.object({
  appointment_id: Joi.number().integer().required(),
});

module.exports = {
  bookAppointmentSchema,
  getAvailableSlotsSchema,
  getPatientAppointmentsSchema,
  confirmAppointmentSchema,
  cancelAppointmentSchema,
  getAppointmentDetailSchema,
};
