const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
  role: Joi.string().valid("patient").default("patient"), // Chỉ cho phép role patient
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updatePatientSchema = Joi.object({
  identityNumber: Joi.string().required(),
});

const updatePatientFullInfoSchema = Joi.object({
  userId: Joi.number().required(),
  updateData: Joi.object({
    full_name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
    identity_number: Joi.string().required(),
  }).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updatePatientSchema,
  updatePatientFullInfoSchema,
};
