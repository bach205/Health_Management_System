const { CREATED } = require("../core/success.response");
const FeedbackService = require("../services/feedback.service");

class FeedbackController {
    // Create feedback for doctor
    async createFeedback(req, res) {
        const result = await FeedbackService.createFeedback(req.user, req.body);
        return new CREATED({
            message: "Feedback created successfully",
            metadata: result,
        }).send(res);
    }

    // Update feedback for doctor
    async updateFeedback(req, res) {
        const result = await FeedbackService.updateFeedback(req.user, req.params.id, req.body);
        return res.status(200).json({
            message: "Feedback updated successfully",
            metadata: result,
        });
    }

    // Delete feedback for doctor
    async deleteFeedback(req, res) {
        const result = await FeedbackService.deleteFeedback(req.user, req.params.id);
        return res.status(200).json({
            message: "Feedback deleted successfully",
            metadata: result,
        });
    }

    // Get average rating for a doctor
    async getAverageRating(req, res) {
        const doctorId = req.params.doctorId;
        const result = await FeedbackService.getAverageRating(doctorId);
        return res.status(200).json({
            message: "Average rating fetched successfully",
            metadata: result,
        });
    }

    // Get list of comments for a doctor with offset & limit
    async getDoctorComments(req, res) {
        const doctorId = req.params.doctorId;
        const { offset = 0, limit = 15 } = req.query;
        const result = await FeedbackService.getDoctorComments(doctorId, Number(offset), Number(limit));
        return res.status(200).json({
            message: "Comments fetched successfully",
            metadata: result,
        });
    }
}

module.exports = new FeedbackController(); 