import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Form, Input, Select, Upload, message, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import { getBlogById, getBlogCategories, updateBlog } from '../../services/blog.service';
import BlogDashboard from './BlogDashboard';
import { getBlogTags } from '../../services/blog.service';
const { Option } = Select;

const EditBlog: React.FC = () => {
  const editorRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [editorInitialValue, setEditorInitialValue] = useState('');
  const { id } = useParams();
  const [tags, setTags] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [catRes, tagRes, blogRes] = await Promise.all([
          getBlogCategories(),
          getBlogTags(),
          getBlogById(Number(id)),
        ]);
        setCategories(catRes.data.metadata || []);
        setTags(tagRes.data.metadata || []);
        const blog = blogRes.data.metadata;
        form.setFieldsValue({
          title: blog.title,
          category_id: blog.category_id,
          tagIds: blog.tags?.map((tag: any) => tag.id), // 👈 đặt giá trị tag
        });
        setThumbnailUrl(blog.image_url || null);
        setEditorInitialValue(blog.content || '');
        editorRef.current?.setContent(blog.content || '');
      } catch (err) {
        message.error('Lỗi tải dữ liệu');
      }
    })();
  }, [id]);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const base64 = await toBase64(file);
    const formData = new URLSearchParams();
    formData.append('key', '6d4c69c509252a5ce7bd746bdc2640c2');
    formData.append('image', base64);

    const res = await axios.post('https://api.imgbb.com/1/upload', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return res.data.data.url;
  };

  const handleSubmit = async (values: any) => {
    const content = editorRef.current?.getContent();
    if (!content) {
      message.error('Vui lòng nhập nội dung');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...values,
        content,
        image_url: thumbnailUrl,
      };
      await updateBlog(Number(id), payload);
      message.success('Cập nhật bài viết thành công!');
      navigate('/admin/blogs');
    } catch (err) {
      console.error(err);
      message.error('Cập nhật bài viết thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip className='my-2' title="Trở về trang quản lý blog">
        <Button onClick={() => navigate('/admin/blogs')}>
          <ChevronLeft className='w-4 h-4' />
        </Button>
      </Tooltip>
      <Card title="Cập nhật bài viết">
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tag" name="tagIds">
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn thẻ"
            >
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>{tag.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Danh mục bài viết" name="category_id">
            <Select placeholder="Chọn danh mục">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh thumbnail">
            <Upload
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
              beforeUpload={async (file) => {
                try {
                  const url = await uploadImageToImgBB(file);
                  setThumbnailUrl(url);
                  message.success('Tải ảnh thành công!');
                } catch (err) {
                  message.error('Tải ảnh thất bại');
                }
                return false;
              }}
              onRemove={() => setThumbnailUrl(null)}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="thumbnail" style={{ marginTop: 10, width: 150, borderRadius: 8 }} />
            )}
          </Form.Item>

          <Form.Item label="Nội dung">
            <Editor
              apiKey="g0ddb1xodv966gvadkt91el6pwvv0x4nuo9apa9ntzswdxy5"
              onInit={(evt, editor) => (editorRef.current = editor)}
              init={{
                height: 500,
                plugins: 'image link code table lists',
                initialValue: editorInitialValue,
                toolbar:
                  'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image link code',
                menubar: false,
                content_style: 'body {font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật bài viết
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default EditBlog;
