const Joi = require("joi");

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    role: Joi.string().valid('patient').default('patient') // Chỉ cho phép role patient
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };