const Joi = require("joi");

const createShiftSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên ca làm việc không được để trống",
    "any.required": "Tên ca làm việc là bắt buộc",
  }),
  start_time: Joi.string().isoDate().required().messages({
    "any.required": "Thời gian bắt đầu là bắt buộc",
    "string.isoDate": "Thời gian bắt đầu không hợp lệ",
  }),
  end_time: Joi.string().isoDate().required().messages({
    "any.required": "Thời gian kết thúc là bắt buộc",
    "string.isoDate": "Thời gian kết thúc không hợp lệ",
  }),
}).custom((obj, helpers) => {
  const startTime = new Date(obj.start_time);
  const endTime = new Date(obj.end_time);
  
  if (startTime >= endTime) {
    return helpers.error("any.invalid", {
      message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    });
  }
  return obj;
});

const updateShiftSchema = Joi.object({
  name: Joi.string().optional(),
  start_time: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Thời gian bắt đầu không hợp lệ",
  }),
  end_time: Joi.string().isoDate().optional().messages({
    "string.isoDate": "Thời gian kết thúc không hợp lệ",
  }),
}).custom((obj, helpers) => {
  if (obj.start_time && obj.end_time) {
    const startTime = new Date(obj.start_time);
    const endTime = new Date(obj.end_time);
    
    if (startTime >= endTime) {
      return helpers.error("any.invalid", {
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      });
    }
  }
  return obj;
});

module.exports = {
  createShiftSchema,
  updateShiftSchema,
};
