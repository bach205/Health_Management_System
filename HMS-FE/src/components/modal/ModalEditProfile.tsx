import { Button, DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
}

const ModalEditProfile = ({ isVisible, handleOk, handleCancel, form }: IProps) => {

    const [identityType, setIdentityType] = useState("citizen");
    
    return (
        <Modal
            open={isVisible}
            title={`Cập nhật thông tin cá nhân`}
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
                    label="Họ tên"
                    name="full_name"
                >
                    <Input placeholder={`Họ tên`} />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                >
                    <Input placeholder={`Email`} disabled />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                        // { required: true, message: "Vui lòng nhập số điện thoại!" },
                        { pattern: new RegExp(/^\d{10}$/), message: "Số điện thoại không hợp lệ!" }
                    ]}
                >
                    <Input placeholder={`Số điện thoại`} />
                </Form.Item>



                <Form.Item
                    name="gender"
                    label="Giới tính"
                    initialValue="male"
                >
                    <Select style={{ width: 100 }} >
                        <Select.Option value="male"><span className="text-black">Nam</span></Select.Option>
                        <Select.Option value="female"><span className="text-black">Nữ</span></Select.Option>
                        <Select.Option value="other"><span className="text-black">Khác</span></Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Địa chỉ" />
                </Form.Item>

                <Form.Item name="date_of_birth" label="Ngày sinh">
                    <DatePicker format="DD/MM/YYYY" placeholder="Ngày sinh" maxDate={dayjs() } />
                </Form.Item>

                <Form.Item
                    name="identity_type"
                    label="Loại định danh"
                    initialValue="citizen"
                >
                    <Select onChange={(value) => setIdentityType(value)} style={{ width: "100%" }}>
                        <Select.Option value="citizen"><span className="text-black">Căn cước công dân</span></Select.Option>
                        <Select.Option value="passport"><span className="text-black">Chứng minh nhân dân</span></Select.Option>
                    </Select>
                </Form.Item>

                {identityType === "citizen" ? (
                    <Form.Item name="identity_number" label="Số CCCD"
                    rules={[
                        { pattern: new RegExp(/^\d{12}$/), message: "Số CCCD không hợp lệ!" }
                    ]}
                    >
                        <Input placeholder="Số CCCD" maxLength={12} />
                    </Form.Item>
                ):(
                    <Form.Item name="identity_number" label="Số CMND"
                    rules={[
                        { pattern: new RegExp(/^\d{12}$/), message: "Số CMND không hợp lệ!" }
                    ]}
                    >
                        <Input placeholder="Số CMND" maxLength={12} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default ModalEditProfile;
