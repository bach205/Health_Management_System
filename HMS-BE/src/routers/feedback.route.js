const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const asyncHandler = require("../helper/asyncHandler");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createFeedbackSchema } = require("../validators/feedBack.validator");

const feedbackRouter = express.Router();

// Get feedback by appointmentId
feedbackRouter.get(
    "/appointment/:appointmentId",
    asyncHandler(feedbackController.getFeedbackByAppointmentId)
);

// Create feedback for doctor (Patient only)
feedbackRouter.post(
    "/",
    authenticate,
    authorize("patient"),
    validate({ body: createFeedbackSchema }),
    asyncHandler(feedbackController.createFeedback)
);

// Update feedback (Patient only)
feedbackRouter.put(
    "/appointment/:appointmentId",
    authenticate,
    authorize("patient"),
    asyncHandler(feedbackController.updateFeedback)
);

// Delete feedback (Patient only)
feedbackRouter.delete(
    "/appointment/:appointmentId",
    authenticate,
    authorize("patient"),
    asyncHandler(feedbackController.deleteFeedback)
);

// Get average rating for a doctor
feedbackRouter.get(
    "/doctor/:doctorId/average-rating",
    asyncHandler(feedbackController.getAverageRating)
);

// Get list of comments for a doctor with offset & limit
feedbackRouter.get(
    "/doctor/:doctorId/comments",
    asyncHandler(feedbackController.getDoctorComments)
);

module.exports = feedbackRouter; 