const { CREATED } = require("../core/success.response");
const FeedbackService = require("../services/feedback.service");

class FeedbackController {
    // Lấy feedback theo appointment_id
    async getFeedbackByAppointmentId(req, res) {
        const appointmentId = req.params.appointmentId;
        const result = await FeedbackService.getFeedbackByAppointmentId(appointmentId);
        return res.status(200).json({
            message: "Feedback fetched successfully",
            metadata: result,
        });
    }

    // Create feedback for doctor (appointment_id)
    async createFeedback(req, res) {
        const result = await FeedbackService.createFeedback(req.user, req.body);
        return new CREATED({
            message: "Feedback created successfully",
            metadata: result,
        }).send(res);
    }

    // Update feedback for doctor (appointment_id)
    async updateFeedback(req, res) {
        const appointmentId = req.params.appointmentId;
        const result = await FeedbackService.updateFeedback(req.user, appointmentId, req.body);
        return res.status(200).json({
            message: "Feedback updated successfully",
            metadata: result,
        });
    }

    // Delete feedback for doctor (appointment_id)
    async deleteFeedback(req, res) {
        const appointmentId = req.params.appointmentId;
        const result = await FeedbackService.deleteFeedback(req.user, appointmentId);
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
        const { offset = 0, limit = 15, sortBy = "newest", star } = req.query;
        const result = await FeedbackService.getDoctorComments(doctorId, Number(offset), Number(limit), sortBy, star);
        return res.status(200).json({
            message: "Comments fetched successfully",
            metadata: result,
        });
    }
}

module.exports = new FeedbackController(); 