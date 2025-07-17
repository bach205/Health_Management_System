const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");

class FeedbackService {
    // Create feedback for doctor
    async createFeedback(user, data) {
        const { appointment_id, rating, comment, is_anonymous } = data;
        // Validate input
        if (!appointment_id || typeof rating !== 'number') {
            throw new BadRequestError("Thiếu thông tin bắt buộc");
        }
        // Get appointment
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointment_id },
            include: { patient: true }
        });
        if (!appointment) {
            throw new BadRequestError("Lịch hẹn không tồn tại");
        }
        // Check patient is owner
        if (appointment.patient_id !== user.id) {
            throw new BadRequestError("Bạn không có quyền đánh giá lịch hẹn này");
        }
        // Check if feedback already exists
        const existing = await prisma.doctorRating.findFirst({
            where: {
                appointment_id: appointment_id,
                patient_id: appointment.patient_id,
                doctor_id: appointment.doctor_id
            }
        });
        if (existing) {
            throw new BadRequestError("Bạn đã đánh giá lịch hẹn này rồi");
        }
        // Create feedback
        const feedback = await prisma.doctorRating.create({
            data: {
                doctor_id: appointment.doctor_id,
                patient_id: appointment.patient_id,
                appointment_id: appointment.id,
                rating,
                comment,
                is_anonymous: is_anonymous
            }
        });
        return feedback;
    }

    // Update feedback for doctor
    async updateFeedback(user, feedbackId, data) {
        // Tìm feedback
        const feedback = await prisma.doctorRating.findUnique({
            where: { id: Number(feedbackId) }
        });
        if (!feedback) {
            throw new BadRequestError("Feedback không tồn tại");
        }
        // Chỉ cho phép bệnh nhân là chủ feedback sửa
        if (feedback.patient_id !== user.id) {
            throw new BadRequestError("Bạn không có quyền sửa feedback này");
        }
        // Cập nhật
        const updated = await prisma.doctorRating.update({
            where: { id: Number(feedbackId) },
            data: {
                rating: data.rating,
                comment: data.comment,
                is_anonymous: data.is_anonymous
            }
        });
        return updated;
    }

    // Delete feedback for doctor
    async deleteFeedback(user, feedbackId) {
        // Tìm feedback
        const feedback = await prisma.doctorRating.findUnique({
            where: { id: Number(feedbackId) }
        });
        if (!feedback) {
            throw new BadRequestError("Feedback không tồn tại");
        }
        // Chỉ cho phép bệnh nhân là chủ feedback xóa
        if (feedback.patient_id !== user.id) {
            throw new BadRequestError("Bạn không có quyền xóa feedback này");
        }
        // Xóa
        await prisma.doctorRating.delete({
            where: { id: Number(feedbackId) }
        });
        return { id: feedbackId };
    }

    // Get average rating for a doctor
    async getAverageRating(doctorId) {
        const result = await prisma.doctorRating.aggregate({
            where: { doctor_id: Number(doctorId) },
            _avg: { rating: true },
            _count: { rating: true }
        });
        return {
            average: result._avg.rating || 0,
            count: result._count.rating
        };
    }

    // Get list of comments for a doctor with offset & limit
    async getDoctorComments(doctorId, offset = 0, limit = 15, sortBy = "newest", star) {
        // Lấy tổng số feedback có comment
        const where = {
            doctor_id: Number(doctorId),
            comment: { not: null, notIn: [""] },
            ...(star ? { rating: Number(star) } : {})
        };
        const total = await prisma.doctorRating.count({
            where
        });
        // Lấy danh sách feedback có comment
        const comments = await prisma.doctorRating.findMany({
            where,
            orderBy: { created_at: sortBy === "oldest" ? "asc" : "desc" },
            skip: offset,
            take: limit,
            select: {
                id: true,
                rating: true,
                comment: true,
                is_anonymous: true,
                created_at: true,
                updated_at: true,
                patient: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                full_name: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });
        return {
            total,
            comments
        };
    }
}

module.exports = new FeedbackService(); 