import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useState } from "react";
import type { EmployeeType } from "../../utils";
interface IProps {
    isVisible: boolean,
    handleOk: () => void,
    handleCancel: () => void,
    form: FormInstance
}
const ModalCreateUser = ({ isVisible, handleOk, handleCancel, form }: IProps) => {
    const [isShowSpecialty, setIsShowSpecialty] = useState(false);

    const handleUserTypeChange = (value: EmployeeType) => {
        setIsShowSpecialty(value === 'doctor');
    };

    return (
        <Modal open={isVisible}
            title={"Thêm nhân viên"}
            onOk={handleOk}
            okText={"Thêm"}
            cancelText="Hủy"
            onCancel={handleCancel}
            destroyOnHidden
        >
            <Form name="addUserForm" form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} style={{ marginTop: 20 }} initialValues={{ gender: "male", }} >

                <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ tên!", },]} >
                    <Input />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập đúng format!", },]} >
                    <Input />
                </Form.Item>

                {/* <Form.Item name="birthday" label="Ngày sinh" rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]} >
                    <DatePicker format="DD/MM/YYYY" placeholder="Ngày sinh" />
                </Form.Item> */}

                <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: "Vui lòng giới tính!" }]} >
                    <Select style={{ width: 100 }}>
                        <Select.Option value="male">Nam</Select.Option>
                        <Select.Option value="female">Nữ</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Địa chỉ" />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }, { pattern: new RegExp(/^\d{10,12}$/), message: "Số điện thoại không hợp lệ!", },]}
                >
                    <Input />
                </Form.Item>

                <Form.Item label="Chức vụ" name="userType" rules={[{ required: true, message: "Chọn Chức vụ!" }]} >
                    <Select onChange={handleUserTypeChange}>
                        <Select.Option value="doctor">Bác sĩ</Select.Option>
                        <Select.Option value="nurse">Y tá</Select.Option>
                        <Select.Option value="pharmacist">Dược sĩ</Select.Option>
                    </Select>
                </Form.Item>
                {isShowSpecialty && (
                    <Form.Item label="Specialty" name="specialty" valuePropName="specialty" rules={[{ required: true, message: "Chuyên khoa" }]} >
                        <Select onChange={handleUserTypeChange}>
                            <Select.Option value="doctor">Bác sĩ</Select.Option>
                            <Select.Option value="nurse">Y tá</Select.Option>
                            <Select.Option value="pharmacist">Dược sĩ</Select.Option>
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}

export default ModalCreateUser;