import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Tag, Spin, message, Button, notification } from 'antd';
import axios from 'axios';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { IBlog } from '../../types/index.type';
import { getBlogById } from '../../services/blog.service';
import { decodeHtml } from '../../utils/String2HTML';

const { Title, Paragraph } = Typography;


const BlogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [blog, setBlog] = useState<IBlog | null>(data);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBlog = async () => {
        try {
            const res = await getBlogById(Number(id));
            setBlog(res.data.metadata);

        } catch (err) {
            notification.error({ message: 'Không tìm thấy bài viết' });
            navigate('/blogs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Quay lại
            </Button>

            {blog.image_url && (
                <img
                    src={blog.image_url}
                    alt={blog.title}
                    style={{ width: '100%', borderRadius: 8, marginBottom: 24 }}
                />
            )}

            <Title>{blog.title}</Title>

            <Paragraph type="secondary">
                {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                {blog.category && (
                    <>
                        {' '}
                        · <Tag color="blue">{blog.category.name}</Tag>
                    </>
                )}
            </Paragraph>

            <div
                dangerouslySetInnerHTML={{ __html: decodeHtml(blog.content) }} style={{ fontSize: 16, lineHeight: 1.75 }}
            />
        </div>
    );
};

export default BlogDetail;
