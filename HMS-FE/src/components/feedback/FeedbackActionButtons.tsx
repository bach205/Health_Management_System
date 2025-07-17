import React, { useEffect, useState } from "react";
import { Button, Modal, Rate, Input, message, Popconfirm, Space, Typography } from "antd";
import { getFeedbackByAppointmentId, createFeedback, updateFeedback, deleteFeedback } from "../../api/feedback";

interface FeedbackActionButtonsProps {
    appointmentId: string | number | undefined;
}

const FeedbackActionButtons: React.FC<FeedbackActionButtonsProps> = ({ appointmentId }) => {
    const [feedback, setFeedback] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    // Hàm lấy feedback theo appointmentId
    const fetchFeedback = async () => {
        if (!appointmentId) return;
        setLoading(true);
        try {
            const res = await getFeedbackByAppointmentId(Number(appointmentId));
            setFeedback(res.metadata);
        } catch {
            setFeedback(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
        // eslint-disable-next-line
    }, [appointmentId]);

    const handleOpenModal = (edit = false) => {
        setEditMode(edit);
        setModalOpen(true);
        if (edit && feedback) {
            setRating(feedback.rating);
            setComment(feedback.comment || "");
        } else {
            setRating(0);
            setComment("");
        }
    };

    const handleSubmit = async () => {
        if (!appointmentId) return;
        if (!rating) {
            message.warning("Vui lòng chọn số sao");
            return;
        }
        setLoading(true);
        try {
            if (editMode && feedback) {
                await updateFeedback(Number(appointmentId), { rating, comment });
                message.success("Cập nhật feedback thành công");
            } else {
                await createFeedback({ appointment_id: Number(appointmentId), rating, comment });
                message.success("Gửi feedback thành công");
            }
            setModalOpen(false);
            await fetchFeedback(); // Cập nhật lại feedback mới nhất
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!appointmentId) return;
        setLoading(true);
        try {
            await deleteFeedback(Number(appointmentId));
            message.success("Xoá feedback thành công");
            setFeedback(null);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginTop: 32, textAlign: "center" }}>
            {feedback ? (
                <Space>
                    <Button onClick={() => handleOpenModal(true)} type="primary">Sửa feedback</Button>
                    <Popconfirm title="Bạn chắc chắn xoá feedback?" onConfirm={handleDelete} okText="Xoá" cancelText="Huỷ">
                        <Button danger>Xoá feedback</Button>
                    </Popconfirm>
                </Space>
            ) : (
                <Button type="primary" onClick={() => handleOpenModal(false)}>Gửi feedback</Button>
            )}
            <Modal
                open={modalOpen}
                title={editMode ? "Sửa feedback" : "Gửi feedback"}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                confirmLoading={loading}
                okText={editMode ? "Cập nhật" : "Gửi"}
                cancelText="Huỷ"
            >
                <div style={{ marginBottom: 16 }}>
                    <span>Đánh giá: </span>
                    <Rate value={rating} onChange={setRating} />
                </div>
                <Input.TextArea
                    rows={4}
                    placeholder="Nhận xét của bạn (không bắt buộc)"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
            </Modal>
            {/* Hiển thị feedback hiện tại nếu có */}
            {feedback && (
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography.Title level={5} style={{ marginBottom: 8 }}>Feedback của bạn</Typography.Title>
                    <Rate disabled value={Math.round(feedback.rating)} style={{ fontSize: 20, color: '#faad14' }} />
                    <span style={{ color: '#faad14', fontWeight: 500, marginBottom: 8 }}>{Math.round(feedback.rating)} / 5</span>
                    {feedback.comment && (
                        <Typography.Paragraph style={{ margin: 0, color: '#333', fontSize: 15, maxWidth: 400 }}>
                            {feedback.comment}
                        </Typography.Paragraph>
                    )}
                    {feedback.created_at && (
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            {new Date(feedback.created_at).toLocaleString()}
                        </Typography.Text>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeedbackActionButtons; 