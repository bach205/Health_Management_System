import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Select,
  Pagination,
  message,
  Input,
  Button,
  Tooltip,
  Flex,
} from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { RotateCcw, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { IBlog, IBlogCategory, ITag } from '../../types/index.type';
import { getBlogCategories, getBlogs } from '../../services/blog.service';
import { getAllTags } from '../../api/tag';

const { Title, Paragraph, Link } = Typography;
const { Option } = Select;

const PAGE_LIMIT = 8;

const BlogDashboard = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [categories, setCategories] = useState<IBlogCategory[]>([]);
  const [tags, setTags] = useState<ITag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [keyword, setKeyword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const fetchCategories = async () => {
    try {
      const res = await getBlogCategories();
      setCategories(res.data.metadata || res.data);
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

  const fetchBlogs = async (
    page: number = 1,
    categoryId?: number,
    tagId?: number
  ) => {
    try {
      const params: any = {
        page,
        pageSize: PAGE_LIMIT,
        published: true,
        keyword,
      };
      if (categoryId) params.category_id = categoryId;
      if (tagId) params.tag_id = tagId;

      const res = await getBlogs(params);
      setBlogs(res.data.metadata);
      setTotalRows(res.data.metadata.length);
    } catch {
      message.error('Lỗi khi tải blog');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();

    const params = new URLSearchParams(location.search);
    const tagIdFromUrl = params.get('tag_id');
    const tagId = tagIdFromUrl ? Number(tagIdFromUrl) : undefined;
    setSelectedTag(tagId);

    fetchBlogs(page, selectedCategory, tagId);
  }, [location.search]);

  useEffect(() => {
    fetchBlogs(page, selectedCategory, selectedTag);
  }, [page, selectedCategory, selectedTag, keyword]);

  const handleSearch = () => {
    setPage(1);
    fetchBlogs(1, selectedCategory, selectedTag);
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedCategory(undefined);
    setSelectedTag(undefined);
    setPage(1);
    fetchBlogs(1);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
        Bài viết mới nhất
      </Title>

      <Flex style={{ margin: '16px 0' }} gap={8} align="center" justify="space-between">
        <Flex gap={8} align="center">
          <Tooltip title="Xoá tất cả bộ lọc">
            <Button icon={<RotateCcw className='w-4 h-4' />} onClick={handleReset} />
          </Tooltip>

          <Input
            placeholder="Tìm tiêu đề"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
          />

          <Tooltip title="Tìm kiếm">
            <Button icon={<Search className='w-4 h-4' />} onClick={handleSearch} />
          </Tooltip>
        </Flex>

        <Flex gap={8}>
          <Select
            placeholder="Chọn tag"
            allowClear
            style={{ width: 200 }}
            value={selectedTag}
            onChange={(value) => {
              setSelectedTag(value);
              setPage(1);
            }}
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.id}>
                {tag.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Chọn danh mục"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setPage(1);
            }}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Flex>
      </Flex>

      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        {blogs?.length > 0 &&
          blogs.map((blog) => (
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
                <Paragraph type="secondary" style={{ fontSize: 13, minHeight: 60 }} />
                <div style={{ marginTop: 4 }}>
                  {blog.tags?.map((tag) => (
                    <Tag
                      color="green"
                      key={tag.id}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blogs?tag_id=${tag.id}`);
                      }}
                    >
                      {tag.name}
                    </Tag>
                  ))}
                </div>
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
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default BlogDashboard;
