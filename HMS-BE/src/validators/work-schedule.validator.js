const Joi = require("joi");

const createWorkScheduleSchema = Joi.object({
  user_id: Joi.number().required().messages({
    "any.required": "ID người dùng là bắt buộc",
  }),
  clinic_id: Joi.number().required().messages({
    "any.required": "ID phòng khám là bắt buộc",
  }),
  work_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    "any.required": "Ngày làm việc là bắt buộc",
    "string.pattern.base": "Ngày làm việc phải có định dạng YYYY-MM-DD",
  }),
  shift_id: Joi.number().required().messages({
    "any.required": "ID ca làm việc là bắt buộc",
  }),
});

const updateWorkScheduleSchema = Joi.object({
  user_id: Joi.number().optional(),
  clinic_id: Joi.number().optional(),
  work_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages({
    "string.pattern.base": "Ngày làm việc phải có định dạng YYYY-MM-DD",
  }),
  shift_id: Joi.number().optional(),
});

module.exports = {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
};
