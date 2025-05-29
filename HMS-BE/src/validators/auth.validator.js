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

const createNurseSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid("male", "female").required(),
});

const updateNurseSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
  gender: Joi.string().valid("male", "female").required(),
  date_of_birth: Joi.string().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Mật khẩu không khớp nhau",
    }),
});

const createDoctorSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid("male", "female").required(),
  date_of_birth: Joi.string().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  specialty: Joi.string().optional().allow(null, ''),
  bio: Joi.string().optional().allow(null, ''),
});

const updateDoctorSchema = Joi.object({
  id: Joi.number().required(),
  full_name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().pattern(/^[0-9]{10}$/).allow(null, ''),
  gender: Joi.string().valid("male", "female").required(),
  date_of_birth: Joi.date().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  specialty: Joi.string().optional().allow(null, ''),
  bio: Joi.string().optional().allow(null, ''),
});

module.exports = {
  registerSchema,
  loginSchema,
  updatePatientSchema,
  updatePatientFullInfoSchema,
  createNurseSchema,
  updateNurseSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  createDoctorSchema,
  updateDoctorSchema,
};
