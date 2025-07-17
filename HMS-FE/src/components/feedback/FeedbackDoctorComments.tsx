import React, { useEffect, useState } from "react";
import { getDoctorComments } from "../../api/feedback";
import { Button, List, Spin, Avatar, Typography, message, Rate, Card, Space, Select, Row, Col } from "antd";

interface FeedbackDoctorCommentsProps {
    doctorId: number;
}

interface CommentItem {
    id: number;
    rating: number;
    comment: string;
    is_anonymous: boolean;
    created_at: string;
    patient: {
        id: number;
        user: {
            full_name: string;
            avatar: string | null;
        };
    };
}

const LIMIT = 15;
const DEFAULT_AVATAR = "https://png.pngtree.com/png-clipart/20250102/original/pngtree-user-avatar-placeholder-black-png-image_6796227.png";

const sortOptions = [
    { label: "Cũ nhất", value: "newest" },
    { label: "Mới nhất", value: "oldest" },
];
const starOptions = [
    { label: "Tất cả", value: undefined },
    ...[5, 4, 3, 2, 1].map(star => ({ label: `${star} sao`, value: star }))
];

const FeedbackDoctorComments: React.FC<FeedbackDoctorCommentsProps> = ({ doctorId }) => {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sortBy, setSortBy] = useState<string>("newest");
    const [star, setStar] = useState<number | undefined>(undefined);

    const fetchComments = async (pageNum = 1, append = false, sort = sortBy, starFilter = star) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);
            const offset = (pageNum - 1) * LIMIT;
            const res = await getDoctorComments(doctorId, LIMIT, offset, sort, starFilter);
            if (res && res.metadata) {
                setTotal(res.metadata.total);
                setComments(prev => append ? [...prev, ...res.metadata.comments] : res.metadata.comments);
            }
        } catch (err) {
            message.error("Không thể tải bình luận");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchComments(1, false, sortBy, star);
        // eslint-disable-next-line
    }, [doctorId, sortBy, star]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage, true, sortBy, star);
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Typography.Title level={4} style={{ marginBottom: 24 }}>Bình luận của bệnh nhân</Typography.Title>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                    <Select
                        value={sortBy}
                        options={sortOptions}
                        onChange={v => setSortBy(v)}
                        style={{ minWidth: 120 }}
                        placeholder="Sắp xếp"
                    />
                </Col>
                <Col>
                    <Select
                        value={star}
                        options={starOptions}
                        onChange={v => setStar(v)}
                        style={{ minWidth: 120 }}
                        placeholder="Số sao"
                        allowClear
                    />
                </Col>
            </Row>
            {loading ? (
                <Spin />
            ) : (
                <List
                    dataSource={comments}
                    locale={{ emptyText: "Chưa có bình luận nào" }}
                    renderItem={item => (
                        <List.Item key={item.id} style={{ padding: 0, border: "none" }}>
                            <Card
                                style={{ width: "100%", marginBottom: 16, borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2" }}
                                bodyStyle={{ padding: 16 }}
                            >
                                <Space align="start" style={{ width: "100%" }}>
                                    <Avatar
                                        size={48}
                                        src={item.patient.user.avatar || DEFAULT_AVATAR}
                                        style={{ marginRight: 12 }}
                                    >
                                        {item.patient.user.full_name?.[0]}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Typography.Text strong>
                                                {item.is_anonymous ? "Ẩn danh" : item.patient.user.full_name}
                                            </Typography.Text>
                                            <span style={{ fontSize: 12, color: '#888' }}>{new Date(item.created_at).toLocaleString()}</span>
                                        </div>
                                        <div style={{ margin: "8px 0 4px 0" }}>
                                            <Rate disabled value={Math.round(item.rating)} style={{ fontSize: 18, color: '#faad14' }} />
                                            <span style={{ marginLeft: 8, color: '#faad14', fontWeight: 500 }}>{Math.round(item.rating)} / 5</span>
                                        </div>
                                        <Typography.Paragraph style={{ margin: 0, color: '#333', fontSize: 15 }}>
                                            {item.comment}
                                        </Typography.Paragraph>
                                    </div>
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
            {comments.length < total && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                    <Button loading={loadingMore} onClick={handleLoadMore} type="primary" shape="round">
                        Tải thêm bình luận
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FeedbackDoctorComments; 