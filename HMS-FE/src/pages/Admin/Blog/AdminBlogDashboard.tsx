import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Flex,
    Input,
    Pagination,
    Popconfirm,
    Row,
    Select,
    Tag,
    Tooltip,
    Typography,
    message
} from 'antd';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalViewBlog from '../../../components/modal/ModalViewBlog';
import { deleteBlog, getBlogCategories, getBlogs } from '../../../services/blog.service';
import type { IBlog, IBlogCategory } from '../../../types/index.type';
import { RotateCcw, Search } from 'lucide-react';
import ModalViewBlog from '../../../components/modal/ModalViewBlog';
import type { ITag } from '../../../types/index.type';
import { getAllTags } from '../../../api/tag';

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
    const [isViewVisible, setIsViewVisible] = useState(false);
    const [currentBlog, setCurrentBlog] = useState<IBlog | null>(null);
    const [selectedTag, setSelectedTag] = useState<number | undefined>(undefined);
    const [tags, setTags] = useState<ITag[]>([]);
    const navigate = useNavigate();

    const fetchCategories = async () => {
        try {
            const res = await getBlogCategories();
            setCategories(res.data.metadata || []);
        } catch {
            message.error('Lỗi khi tải danh mục');
        }
    };
    const fetchTags = async () => {
        try {
            const res = await getAllTags();
            setTags(res.data.metadata || []);
        } catch {
            message.error('Lỗi khi tải tag');
        }
    };


    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                pageSize: PAGE_LIMIT,
                keyword,
                tag_id: selectedTag, // Assuming selectedTag is defined in your state
            };
            if (selectedCategory) {
                params.category_id = selectedCategory;
            }

            const res = await getBlogs(params);
            console.log(res)
            const blogs = res.data.metadata;
            setBlogs(blogs);
            setTotalRows(blogs.length);
            console.log(blogs)
            setBlogs(blogs);
            //setTotalRows(total);
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

    const handleView = (blog: IBlog) => {
        setCurrentBlog(blog);
        setIsViewVisible(true);
    };

    const truncate = (text: string, maxLength = 100) => {
        return text?.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    useEffect(() => {
        fetchCategories();
        fetchTags();
        fetchBlogs();
    }, [page, selectedCategory, selectedTag, keyword]);

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
                    placeholder="Chọn tag"
                    allowClear
                    style={{ width: 200 }}
                    value={selectedTag}
                    onChange={(value) => setSelectedTag(value)}
                >
                    {tags.map((tag) => (
                        <Option key={tag.id} value={tag.id}>{tag.name}</Option>
                    ))}
                </Select>
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
                {Array.isArray(blogs) && blogs.map((blog) => (
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
                                <EyeOutlined key="view" onClick={() => handleView(blog)} />,
                                <EditOutlined key="edit" onClick={() => navigate(`/blog/${blog.id}`)} />,
                                <Popconfirm
                                    key="popconfirm-delete"
                                    title="Bạn chắc chắn xoá?"
                                    onConfirm={() => handleDelete(blog.id)}
                                    okText="Xoá"
                                    cancelText="Hủy"
                                >
                                    <DeleteOutlined />
                                </Popconfirm>
                            ]}
                        >
                            <Title level={5}>{blog.title}</Title>
                            <Paragraph type="secondary" style={{ fontSize: 13, minHeight: 60 }}>
                                {/* {truncate(blog.content)} */}
                            </Paragraph>
                            <div style={{ marginTop: 8 }}>
                                {blog.tags?.map((tag: any) => (
                                    <Tag color="green" key={tag.id}>{tag.name}</Tag>
                                ))}
                            </div>

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

            <ModalViewBlog
                isVisible={isViewVisible}
                handleCancel={() => setIsViewVisible(false)}
                form={{} as any}
                blog={currentBlog}
            />
        </div>
    );
};

export default AdminBlogDashboard;


