import React, { useEffect, useState } from 'react';
import {
    Row, Col, Card, Typography, Tag, Select, Pagination,
    message, Input, Button, Space, Popconfirm,
    Tooltip,
    Flex
} from 'antd';
import { SearchOutlined, ArrowRightOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { deleteBlog, getBlogCategories, getBlogs } from '../../../services/blog.service';
import type { IBlog, IBlogCategory } from '../../../types/index.type';
import { RotateCcw, Search } from 'lucide-react';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const PAGE_LIMIT = 8;

const AdminBlogDashboard = () => {
    const [blogs, setBlogs] = useState<IBlog[]>([]);
    const [categories, setCategories] = useState<IBlogCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const res = await getBlogCategories();
            setCategories(res.data.metadata || []);
        } catch {
            message.error('Lỗi khi tải danh mục');
        }
    };

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                pageSize: PAGE_LIMIT,
                keyword,
            };
            if (selectedCategory) {
                params.category_id = selectedCategory;
            }

            const res = await getBlogs(params);
            console.log(res)
            const blogs = res.data.metadata;
            const total = blogs.length;
            console.log(blogs)
            setBlogs(blogs);
            setTotalRows(total);
        } catch {
            message.error('Lỗi khi tải bài viết');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteBlog(id);
            message.success('Xoá bài viết thành công');
            fetchBlogs();
        } catch {
            message.error('Xoá bài viết thất bại');
        }
    };

    const truncate = (text: string, maxLength = 100) => {
        return text?.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    useEffect(() => {
        fetchCategories();
        fetchBlogs();
    }, [page, selectedCategory]);

    const handleSearch = () => {
        setPage(1);
        fetchBlogs();
    };

    const handleReset = () => {
        setKeyword('');
        setSelectedCategory(undefined);
        setPage(1);
        fetchBlogs();
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={3}>Quản lý bài viết</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/admin/blogs/create')}
                >
                    Tạo bài viết
                </Button>
            </div>

            <Flex style={{ marginBottom: 16 }} gap={8} align="center" justify='space-between'>
                <Flex gap={8} align="center">
                    <Tooltip title="Xoá tất cả bộ lọc">
                        <Button icon={<RotateCcw className='w-4 h-4' />} onClick={handleReset}>
                        </Button>
                    </Tooltip>
                    <Input
                        placeholder="Tìm kiếm tiêu đề"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 240 }}
                    />
                    <Tooltip title="Tìm kiếm">

                        <Button icon={<Search className='w-4 h-4' />} onClick={handleSearch}>
                        </Button>
                    </Tooltip>

                </Flex>
                <Select
                    placeholder="Chọn danh mục"
                    allowClear
                    style={{ width: 200 }}
                    className='ml-auto'
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value)}
                >
                    {categories.map((cat) => (
                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                    ))}
                </Select>

            </Flex>

            <Row gutter={[24, 24]}>
                {blogs.map((blog) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={blog.id}>
                        <Card
                            hoverable
                            cover={
                                blog.image_url ? (
                                    <img
                                        alt={blog.title}
                                        src={blog.image_url}
                                        style={{ height: 180, objectFit: 'cover' }}
                                    />
                                ) : null
                            }
                            actions={[
                                <EditOutlined key="edit" onClick={() => navigate(`/blog/${blog.id}`)} />,
                                <Popconfirm
                                    title="Bạn chắc chắn xoá?"
                                    onConfirm={() => handleDelete(blog.id)}
                                    okText="Xoá"
                                    cancelText="Hủy"
                                >
                                    <DeleteOutlined key="delete" />
                                </Popconfirm>
                            ]}
                        >
                            <Title level={5}>{blog.title}</Title>
                            <Paragraph type="secondary" style={{ fontSize: 13, minHeight: 60 }}>
                                {truncate(blog.content)}
                            </Paragraph>
                            {blog.category?.name && <Tag color="blue">{blog.category.name}</Tag>}
                        </Card>
                    </Col>
                ))}
            </Row>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                    current={page}
                    pageSize={PAGE_LIMIT}
                    total={totalRows}
                    onChange={setPage}
                />
            </div>
        </div>
    );
};

export default AdminBlogDashboard;
