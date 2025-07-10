const Joi = require("joi");

const createFeedbackSchema = Joi.object({
    appointmentId: Joi.number().required(),
    rating: Joi.number().min(0).max(5).required(),
    comment: Joi.string().allow('').optional(),
    isAnonymous: Joi.boolean().optional()
});

module.exports = {
    createFeedbackSchema
};
