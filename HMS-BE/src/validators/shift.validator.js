const Joi = require("joi");

const createShiftSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên ca làm việc không được để trống",
    "any.required": "Tên ca làm việc là bắt buộc",
  }),
  start_time: Joi.date().required().messages({
    "any.required": "Thời gian bắt đầu là bắt buộc",
  }),
  end_time: Joi.date().required().messages({
    "any.required": "Thời gian kết thúc là bắt buộc",
  }),
}).custom((obj, helpers) => {
  if (new Date(obj.start_time) >= new Date(obj.end_time)) {
    return helpers.error("any.invalid", {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    });
  }
  return obj;
});

const updateShiftSchema = Joi.object({
  name: Joi.string().optional(),
  start_time: Joi.date().optional(),
  end_time: Joi.date().optional(),
}).custom((obj, helpers) => {
  if (
    obj.start_time &&
    obj.end_time &&
    new Date(obj.start_time) >= new Date(obj.end_time)
  ) {
    return helpers.error("any.invalid", {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    });
  }
  return obj;
});

module.exports = {
  createShiftSchema,
  updateShiftSchema,
};
