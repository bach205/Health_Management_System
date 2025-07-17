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
    const data = {
        id: 1,
        title: "Cách phòng ngừa bệnh tiểu đường",
        content: `
          Bệnh tiểu đường là một trong những bệnh lý phổ biến hiện nay, đặc biệt là ở người trưởng thành. Để phòng ngừa bệnh tiểu đường, bạn cần thay đổi thói quen ăn uống và duy trì một lối sống lành mạnh. 
          
          1. Ăn nhiều rau xanh và trái cây.
          2. Tránh ăn thực phẩm có nhiều đường và tinh bột.
          3. Tập thể dục đều đặn để giữ cân nặng ổn định.
          4. Kiểm tra đường huyết định kỳ để phát hiện sớm dấu hiệu của bệnh tiểu đường.
    
          Nếu bạn có bất kỳ câu hỏi nào về cách phòng ngừa bệnh tiểu đường, hãy tham khảo ý kiến bác sĩ.
        `,
        summary: "Bài viết này cung cấp thông tin về cách phòng ngừa bệnh tiểu đường.",
        image_url: "https://example.com/tiểu-đường.jpg",
        created_at: "2025-07-16",
        published: true,
        category: { id: 1, name: "Bệnh tiểu đường" }
    }
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
