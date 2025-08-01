const Joi = require("joi");

const todayStart = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const bookAppointmentSchema = Joi.object({
  patient_id: Joi.number().integer().required().messages({
    'number.base': 'ID bệnh nhân phải là số',
    'any.required': 'ID bệnh nhân là bắt buộc'
  }),
  doctor_id: Joi.number().integer().required().messages({
    'number.base': 'ID bác sĩ phải là số',
    'any.required': 'ID bác sĩ là bắt buộc'
  }),
  clinic_id: Joi.number().integer().required().messages({
    'number.base': 'ID phòng khám phải là số',
    'any.required': 'ID phòng khám là bắt buộc'
  }),
  slot_date: Joi.date().required().custom((value, helpers) => {
    const today = todayStart();
    const slot = new Date(value);
    slot.setHours(0, 0, 0, 0);
    if (slot < today) {
      return helpers.error('date.min', { limit: today });
    }
    return value;
  }).messages({
    'date.base': 'Ngày hẹn không hợp lệ',
    'date.min': 'Ngày hẹn phải là hôm nay hoặc sau hôm nay',
    'any.required': 'Ngày hẹn là bắt buộc'
  }),
  start_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Thời gian không đúng định dạng (HH:mm:ss)',
      'any.required': 'Thời gian hẹn là bắt buộc'
    }),
  reason: Joi.string().max(1000).allow("", null).messages({
    'string.max': 'Lý do không được vượt quá 1000 ký tự'
  }),
  note: Joi.string().max(1000).allow("", null).messages({
    'string.max': 'Ghi chú không được vượt quá 1000 ký tự'
  }),
});

const nurseBookAppointmentSchema = Joi.object({
  // patient_id: Joi.number().integer().required().messages({
  //   'number.base': 'ID bệnh nhân phải là số',
  //   'any.required': 'ID bệnh nhân là bắt buộc'
  // }),
  doctor_id: Joi.number().integer().required().messages({
    'number.base': 'ID bác sĩ phải là số',
    'any.required': 'ID bác sĩ là bắt buộc'
  }),
  clinic_id: Joi.number().integer().required().messages({
    'number.base': 'ID phòng khám phải là số',
    'any.required': 'ID phòng khám là bắt buộc'
  }),
  appointment_date: Joi.date().required().custom((value, helpers) => {
    const today = todayStart();
    const slot = new Date(value);
    slot.setHours(0, 0, 0, 0);
    if (slot < today) {
      return helpers.error('date.min', { limit: today });
    }
    return value;
  }).messages({
    'date.base': 'Ngày hẹn không hợp lệ',
    'date.min': 'Ngày hẹn phải là hôm nay hoặc sau hôm nay',
    'any.required': 'Ngày hẹn là bắt buộc'
  }),
  appointment_time: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Thời gian không đúng định dạng (HH:mm:ss)',
      'any.required': 'Thời gian hẹn là bắt buộc'
    }),
  reason: Joi.string().max(1000).allow("", null).messages({
    'string.max': 'Lý do không được vượt quá 1000 ký tự'
  }),
  note: Joi.string().max(1000).allow("", null).messages({
    'string.max': 'Ghi chú không được vượt quá 1000 ký tự'
  }),
}).unknown(true);

const IsPatientIdValid = Joi.object({
  patient_id: Joi.number().integer().required().messages({
    'number.base': 'ID bệnh nhân phải là số',
    'any.required': 'ID bệnh nhân là bắt buộc'
  }),
})

// const getAvailableSlotsSchema = Joi.object({
//   doctor_id: Joi.number().integer().required().messages({
//     'number.base': 'ID bác sĩ phải là số',
//     'any.required': 'ID bác sĩ là bắt buộc'
//   }),
//   clinic_id: Joi.number().integer().required().messages({
//     'number.base': 'ID phòng khám phải là số',
//     'any.required': 'ID phòng khám là bắt buộc'
//   }),
//   slot_date: Joi.date().required().messages({
//     'date.base': 'Ngày không hợp lệ',
//     'any.required': 'Ngày là bắt buộc'
//   }),
// });

const getPatientAppointmentsSchema = Joi.object({
  patient_id: Joi.number().integer().required().messages({
    'number.base': 'ID bệnh nhân phải là số',
    'any.required': 'ID bệnh nhân là bắt buộc'
  }),
});

const confirmAppointmentSchema = Joi.object({
  appointment_id: Joi.number().integer().required().messages({
    'number.base': 'ID lịch hẹn phải là số',
    'any.required': 'ID lịch hẹn là bắt buộc'
  }),
});

const cancelAppointmentSchema = Joi.object({
  appointment_id: Joi.number().integer().required().messages({
    'number.base': 'ID lịch hẹn phải là số',
    'any.required': 'ID lịch hẹn là bắt buộc'
  }),
  reason: Joi.string().max(1000).allow("", null).messages({
    'string.max': 'Lý do không được vượt quá 1000 ký tự'
  }),
});

const getAppointmentDetailSchema = Joi.object({
  appointment_id: Joi.number().integer().required().messages({
    'number.base': 'ID lịch hẹn phải là số',
    'any.required': 'ID lịch hẹn là bắt buộc'
  }),
});

const nurseRescheduleAppointmentSchema = Joi.object({
  old_appointment_id: Joi.number().required().messages({
    'number.base': 'ID lịch hẹn cũ phải là số',
    'any.required': 'ID lịch hẹn cũ là bắt buộc'
  }),
  patient_id: Joi.number().required().messages({
    'number.base': 'ID bệnh nhân phải là số',
    'any.required': 'ID bệnh nhân là bắt buộc'
  }),
  doctor_id: Joi.number().required().messages({
    'number.base': 'ID bác sĩ phải là số',
    'any.required': 'ID bác sĩ là bắt buộc'
  }),
  clinic_id: Joi.number().required().messages({
    'number.base': 'ID phòng khám phải là số',
    'any.required': 'ID phòng khám là bắt buộc'
  }),
  slot_date: Joi.date().iso().required().messages({
    'date.base': 'Ngày Đặt Lịch không hợp lệ',
    'date.format': 'Ngày Đặt Lịch phải theo định dạng ISO',
    'any.required': 'Ngày Đặt Lịch là bắt buộc'
  }),
  start_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Giờ khám phải theo định dạng HH:mm:ss',
    'any.required': 'Giờ khám là bắt buộc'
  }),
  reason: Joi.string().required().messages({
    'string.base': 'Lý do khám phải là chuỗi',
    'any.required': 'Lý do khám là bắt buộc'
  }),
  note: Joi.string().allow('', null).messages({
    'string.base': 'Ghi chú phải là chuỗi'
  }),
  cancel_reason: Joi.string().allow('', null).messages({
    'string.base': 'Lý do hủy phải là chuỗi'
  })
});

const bookAppointmentByQRSchema = Joi.object({
  full_name: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  address: Joi.string().required(),
  date_of_birth: Joi.date().less(new Date(Date.now() - 16 * 365.25 * 24 * 60 * 60 * 1000)).required().messages({
    'date.less': 'Người đặt lịch phải trên 16 tuổi',
    'date.base': 'Ngày sinh không hợp lệ',
    'any.required': 'Ngày sinh là bắt buộc'
  }),
  identity_number: Joi.string().required(),
  doctor_id: Joi.number().integer().required(),
  clinic_id: Joi.number().integer().required(),
  slot_date: Joi.date().required(),
  start_time: Joi.string().required(),
  reason: Joi.string().max(1000).allow("", null),
  note: Joi.string().max(1000).allow("", null)
});

module.exports = {
  bookAppointmentSchema,
  // getAvailableSlotsSchema,
  getPatientAppointmentsSchema,
  confirmAppointmentSchema,
  cancelAppointmentSchema,
  getAppointmentDetailSchema,
  nurseBookAppointmentSchema,
  IsPatientIdValid,
  nurseRescheduleAppointmentSchema,
  bookAppointmentByQRSchema
};
