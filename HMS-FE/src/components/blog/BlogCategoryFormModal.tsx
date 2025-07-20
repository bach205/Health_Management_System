import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

interface BlogCategoryFormModalProps {
    visible: boolean;
    onOk: (values: { name: string }) => void;
    onCancel: () => void;
    initialValues?: { name?: string };
}

const BlogCategoryFormModal: React.FC<BlogCategoryFormModalProps> = ({ visible, onOk, onCancel, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.setFieldsValue(initialValues || { name: '' });
        }
    }, [visible, initialValues, form]);

    return (
        <Modal
            open={visible}
            title={initialValues ? 'Cập nhật danh mục' : 'Tạo danh mục'}
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        onOk(values);
                        form.resetFields();
                    });
            }}
            destroyOnClose
        >
            <Form form={form} layout="vertical" initialValues={initialValues}>
                <Form.Item
                    label="Tên danh mục"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BlogCategoryFormModal; 