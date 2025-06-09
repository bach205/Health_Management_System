const Joi = require("joi");

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
  appointment_date: Joi.date().greater('now').required().messages({
    'date.base': 'Ngày hẹn không hợp lệ',
    'date.greater': 'Ngày hẹn phải lớn hơn ngày hiện tại',
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
  appointment_date: Joi.date().greater('now').required().messages({
    'date.base': 'Ngày hẹn không hợp lệ',
    'date.greater': 'Ngày hẹn phải lớn hơn ngày hiện tại',
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

const getAvailableSlotsSchema = Joi.object({
  doctor_id: Joi.number().integer().required().messages({
    'number.base': 'ID bác sĩ phải là số',
    'any.required': 'ID bác sĩ là bắt buộc'
  }),
  clinic_id: Joi.number().integer().required().messages({
    'number.base': 'ID phòng khám phải là số',
    'any.required': 'ID phòng khám là bắt buộc'
  }),
  appointment_date: Joi.date().required().messages({
    'date.base': 'Ngày không hợp lệ',
    'any.required': 'Ngày là bắt buộc'
  }),
});

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

module.exports = {
  bookAppointmentSchema,
  getAvailableSlotsSchema,
  getPatientAppointmentsSchema,
  confirmAppointmentSchema,
  cancelAppointmentSchema,
  getAppointmentDetailSchema,
  nurseBookAppointmentSchema,
  IsPatientIdValid,
};
