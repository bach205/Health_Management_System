const Joi = require("joi");

const createFeedbackSchema = Joi.object({
    appointment_id: Joi.number().required(),
    rating: Joi.number().min(0).max(5).required(),
    comment: Joi.string().allow('').optional(),
    is_anonymous: Joi.boolean().optional()
});

module.exports = {
    createFeedbackSchema
};
