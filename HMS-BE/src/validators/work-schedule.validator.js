const Joi = require("joi");

const createWorkScheduleSchema = Joi.object({
  user_id: Joi.number().required().messages({
    "any.required": "ID người dùng là bắt buộc",
  }),
  clinic_id: Joi.number().required().messages({
    "any.required": "ID phòng khám là bắt buộc",
  }),
  work_date: Joi.date().required().messages({
    "any.required": "Ngày làm việc là bắt buộc",
  }),
  shift_id: Joi.number().required().messages({
    "any.required": "ID ca làm việc là bắt buộc",
  }),
});

const updateWorkScheduleSchema = Joi.object({
  user_id: Joi.number().optional(),
  clinic_id: Joi.number().optional(),
  work_date: Joi.date().optional(),
  shift_id: Joi.number().optional(),
});

module.exports = {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
};
