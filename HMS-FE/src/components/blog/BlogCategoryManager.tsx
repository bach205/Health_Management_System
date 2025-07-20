import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Space, Select, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import BlogCategoryFormModal from './BlogCategoryFormModal';
import { getBlogCategoriesNoPagination, createBlogCategory, updateBlogCategory, deleteBlogCategory } from '../../services/blog.service';
import type { IBlogCategory } from '../../types/index.type';

const PAGE_SIZE = 8;

const BlogCategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<IBlogCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<IBlogCategory | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await getBlogCategoriesNoPagination({ page, pageSize: PAGE_SIZE, order: sortOrder });
            setCategories(res.data.metadata?.data || res.data.metadata || []);
            setTotal(res.data.metadata?.total || res.data.metadata?.length || 0);
        } catch {
            message.error('Lỗi khi tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line
    }, [page, sortOrder]);

    const handleCreate = () => {
        setEditingCategory(null);
        setModalVisible(true);
    };

    const handleEdit = (cat: IBlogCategory) => {
        setEditingCategory(cat);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteBlogCategory(id);
            message.success('Xóa danh mục thành công');
            fetchCategories();
        } catch {
            message.error('Xóa danh mục thất bại');
        }
    };

    const handleModalOk = async (values: { name: string }) => {
        try {
            if (editingCategory) {
                await updateBlogCategory(editingCategory.id, values);
                message.success('Cập nhật danh mục thành công');
            } else {
                await createBlogCategory(values);
                message.success('Tạo danh mục thành công');
            }
            setModalVisible(false);
            fetchCategories();
        } catch {
            message.error('Lỗi khi lưu danh mục');
        }
    };

    const handleSortChange = (value: 'asc' | 'desc') => {
        setSortOrder(value);
        setPage(1);
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Thêm danh mục
                </Button>
                <Select
                    value={sortOrder}
                    style={{ width: 180 }}
                    onChange={handleSortChange}
                    options={[
                        { value: 'asc', label: 'Tên A-Z' },
                        { value: 'desc', label: 'Tên Z-A' },
                    ]}
                />
            </Space>
            <Table
                dataSource={categories}
                rowKey="id"
                loading={loading}
                columns={[
                    {
                        title: 'STT',
                        dataIndex: 'stt',
                        width: 80,
                        render: (_: any, __: IBlogCategory, idx: number) => (page - 1) * PAGE_SIZE + idx + 1,
                    },
                    { title: 'Tên danh mục', dataIndex: 'name' },
                    {
                        title: 'Hành động',
                        key: 'action',
                        render: (_: any, record: IBlogCategory) => (
                            <Space>
                                <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                                <Popconfirm
                                    title="Bạn chắc chắn xóa?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                >
                                    <Button icon={<DeleteOutlined />} danger />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
                pagination={false}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    onChange={setPage}
                    showSizeChanger={false}
                />
            </div>
            <BlogCategoryFormModal
                visible={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                initialValues={editingCategory ? { name: editingCategory.name } : undefined}
            />
        </div>
    );
};

export default BlogCategoryManager; 