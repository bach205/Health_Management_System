const Joi = require("joi");

const examinationRecordSchema = Joi.object({
  patient_id: Joi.number().required(),
  symptoms: Joi.string().required(),
  primary_doctor_id: Joi.number().required(),
  final_diagnosis: Joi.string().required(),
  created_by_user_id: Joi.number().optional(),
});

const examinationDetailSchema = Joi.object({
  clinic_id: Joi.number().required(),
  doctor_id: Joi.number().required(),
  result: Joi.string().required(),
  note: Joi.string().required(),
  examined_at: Joi.date().required(),
  status: Joi.string()
    .valid("pending", "in_progress", "done", "cancelled")
    .required(),
  to_clinic_id: Joi.number().optional(),
  from_clinic_id: Joi.number().optional(),
  created_by_user_id: Joi.number().optional(),
  total_cost: Joi.number().optional(),
  patient_id: Joi.number().required(),
});

module.exports = {
  examinationRecordSchema,
  examinationDetailSchema,
};
