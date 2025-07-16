import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tag, Select, Pagination, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { IBlog, IBlogCategory } from '../../types/index.type';
import { getBlogCategories, getBlogs } from '../../services/blog.service';

const { Title, Paragraph, Link } = Typography;
const { Option } = Select;

const PAGE_LIMIT = 8;

const BlogDashboard = () => {
    const [blogs, setBlogs] = useState<IBlog[]>([]);
    const [categories, setCategories] = useState<IBlogCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const res = await getBlogCategories();
            setCategories(res.data.metadata || res.data); // tùy API
        } catch (err) {
            message.error('Lỗi khi tải danh mục');
        }
    };

    const fetchBlogs = async (page: number, categoryId?: number) => {
        try {
            const params: any = {
                page,
                pageSize: PAGE_LIMIT,
            };
            if (categoryId) {
                params.category_id = categoryId;
            }

            // const res = await getBlogs(params);
            // setBlogs(res.data.metadata.data);
            // setTotalRows(res.data.metadata.pagination.total);
        } catch (err) {
            message.error('Lỗi khi tải blog');
        }
    };

    useEffect(() => {
        // fetchCategories();
        // fetchBlogs(1);
    }, []);

    const handleCategoryChange = (value?: number) => {
        setSelectedCategory(value);
        setPage(1);
        fetchBlogs(1, value);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchBlogs(newPage, selectedCategory);
    };

    const truncate = (text: string, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
                    Bài viết mới nhất
                </Title>
                <Select
                    placeholder="Chọn danh mục"
                    allowClear
                    style={{ width: 200 }}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    {categories?.map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                            {cat.name}
                        </Option>
                    ))}
                </Select>
            </div>

            <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
                {blogs.map((blog) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={blog.id}>
                        <Card
                            hoverable
                            cover={
                                <img
                                    alt={blog.title}
                                    src={blog.image_url}
                                    style={{ height: 180, objectFit: 'cover' }}
                                />
                            }
                            style={{ borderRadius: 8 }}
                            onClick={() => navigate(`/blogs/${blog.id}`)}
                        >
                            <Title level={5} style={{ marginBottom: 8, color: '#1890ff' }}>
                                {blog.title}
                            </Title>
                            <Paragraph type="secondary" style={{ fontSize: 13, minHeight: 60 }}>
                                {truncate(blog.content)}
                            </Paragraph>
                            {blog.category?.name && <Tag color="blue">{blog.category.name}</Tag>}
                            <div style={{ marginTop: 8 }}>
                                <Link href={`/blogs/${blog.id}`}>
                                    Xem thêm <ArrowRightOutlined />
                                </Link>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                    current={page}
                    pageSize={PAGE_LIMIT}
                    total={totalRows}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default BlogDashboard;
