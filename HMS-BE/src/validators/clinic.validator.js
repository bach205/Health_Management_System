const Joi = require("joi");

const createClinicSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên phòng khám không được để trống",
    "any.required": "Tên phòng khám là bắt buộc",
  }),
  description: Joi.string().allow("").optional(),
});

const updateClinicSchema = Joi.object({
  name: Joi.string().messages({
    "string.empty": "Tên phòng khám không được để trống",
  }),
  description: Joi.string().allow("").optional(),
});

module.exports = {
  createClinicSchema,
  updateClinicSchema,
};
