import { Button, Checkbox, DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
}

const ModalEditPassword = ({ isVisible, handleOk, handleCancel, form }: IProps) => {

    return (
        <Modal
            open={isVisible}
            title={`Cập nhật mật khẩu`}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>

                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleOk}>
                    Cập nhật
                </Button>,
            ]}
            destroyOnHidden
            centered
        >
            <Form
                name="updateUserForm"
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                style={{ marginTop: 20 }}
                initialValues={{ gender: "male" }}
            >

                <Form.Item
                    label="Mật khẩu cũ"
                    name="oldPassword"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                        { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                    ]}
                >
                    <Input.Password placeholder="Mật khẩu cũ" />
                </Form.Item>
                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                        { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                    ]}
                >
                    <Input.Password placeholder="Mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    label="Xác nhận"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Xác nhận mật khẩu mới" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalEditPassword;
