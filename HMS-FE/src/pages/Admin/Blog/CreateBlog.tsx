import React, { useRef, useState, useEffect } from 'react';
import { Button, Form, Input, Select, Upload, message, Card, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { createBlog, getBlogCategories } from '../../../services/blog.service';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getBlogTags } from '../../../services/blog.service';
import ModalTagManager from '../../../components/modal/ModalTagManager';
import type { ITag } from '../../../types/index.type';
import { getAllTags } from '../../../api/tag';

const { Option } = Select;

const CreateBlog: React.FC = () => {
    const [tags, setTags] = useState<ITag[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [openTagModal, setOpenTagModal] = useState(false);
    const editorRef = useRef<any>(null);
    const [form] = Form.useForm();
    const [categories, setCategories] = useState<any[]>([]);

    const fetchTags = async () => {
        try {
            const res = await getAllTags();
            setTags(res.data.metadata || []);
        } catch {
            message.error('Lỗi khi tải tag');
        }
    };
    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getBlogCategories();
            setCategories(res.data.metadata || []);
        };
        fetchCategories();
    }, []);
    const [loading, setLoading] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    useEffect(() => {
        axios.get('/blog-category').then((res) => {
            setCategories(res.data.metadata || []);
        });
    }, []);

    useEffect(() => {
        getBlogTags().then((res) => {
            setTags(res.data.metadata || []);
        });
    }, []);



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
        console.log("content:", content)

        try {
            setLoading(true);
            const payload = {
                ...values,
                content,
                image_url: thumbnailUrl,
                published: true, // Mặc định là xuất bản
                tagIds: selectedTagIds, // Gửi danh sách tag đã chọn
            };
            // await axios.post('/blog', payload);
            await createBlog(payload);
            message.success('Tạo bài viết thành công!');
            form.resetFields();
            editorRef.current?.setContent('');
            setThumbnailUrl(null);
        } catch (err) {
            message.error('Tạo bài viết thất bại');
        } finally {
            setLoading(false);
        }
    };
    const navigate = useNavigate();

    return (
        <>
            <Tooltip className='my-2' title="Trở về trang quản lý blog">
                <Button onClick={() => navigate('/admin/blogs')}>
                    <ChevronLeft className='w-4 h-4' />
                </Button>
            </Tooltip>
            <Card title="Tạo bài viết mới">
                <Form layout="vertical" onFinish={handleSubmit} form={form}>
                    <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Tag" name="tagIds">
                        <Select
                            mode="multiple"
                            placeholder="Chọn các tag"
                            value={selectedTagIds}
                            onChange={setSelectedTagIds}
                            options={tags.map((tag) => ({
                                label: tag.name,
                                value: tag.id,
                            }))}
                        />
                    </Form.Item>
                    <Button type="link" onClick={() => setOpenTagModal(true)}>
                        Quản lý Tag
                    </Button>

                    <Form.Item label="Danh mục bài viết" name="category_id" rules={[{ required: false, message: 'Chọn danh mục' }]}>
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
                                menubar: false,
                                toolbar:
                                    'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image link code',
                                automatic_uploads: true,
                                file_picker_types: 'image',
                                file_picker_callback: (callback, value, meta) => {
                                    const input = document.createElement('input');
                                    input.setAttribute('type', 'file');
                                    input.setAttribute('accept', 'image/*');

                                    input.onchange = async () => {
                                        const file = input.files?.[0];
                                        if (!file) return;

                                        try {
                                            const base64 = await toBase64(file);
                                            const formData = new URLSearchParams();
                                            formData.append('key', '6d4c69c509252a5ce7bd746bdc2640c2');
                                            formData.append('image', base64);

                                            const res = await axios.post('https://api.imgbb.com/1/upload', formData.toString(), {
                                                headers: {
                                                    'Content-Type': 'application/x-www-form-urlencoded',
                                                },
                                            });

                                            const imageUrl = res.data?.data?.url;
                                            if (imageUrl) {
                                                callback(imageUrl, { alt: file.name }); // ✅ chèn ảnh vào editor
                                            } else {
                                                message.error('Không thể upload ảnh');
                                            }
                                        } catch (err) {
                                            console.error('Lỗi upload:', err);
                                            message.error('Tải ảnh thất bại');
                                        }
                                    };

                                    input.click();
                                },

                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                            }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Đăng bài viết
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            <ModalTagManager
                open={openTagModal}
                onClose={() => setOpenTagModal(false)}
                onTagUpdate={fetchTags} // reload lại tag list sau khi thêm/sửa
            />
        </>
    );
};

export default CreateBlog;
