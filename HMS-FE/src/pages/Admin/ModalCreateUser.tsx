import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useState } from "react";
import type { EmployeeType } from "../../utils";
import dayjs from "dayjs";

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
            title={"Thêm bác sĩ"}
            onOk={handleOk}
            okText={"Thêm"}
            cancelText="Hủy"
            onCancel={handleCancel}
            destroyOnHidden
            centered
        >
            <Form name="addDoctorForm" form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} style={{ marginTop: 20 }} initialValues={{ gender: "male", }} >

                <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ tên!", },]} >
                    <Input placeholder="Họ tên bác sĩ" />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập đúng format!", },]} >
                    <Input placeholder="Email bác sĩ" />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="phone"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }, { pattern: new RegExp(/^\d{10,12}$/), message: "Số điện thoại không hợp lệ!", },]}
                >
                    <Input placeholder="Số điện thoại bác sĩ" />
                </Form.Item>

                <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: "Vui lòng giới tính!" }]} >
                    <Select style={{ width: 100 }}>
                        <Select.Option value="male">Nam</Select.Option>
                        <Select.Option value="female">Nữ</Select.Option>
                    </Select>
                </Form.Item>
               <Form.Item label="Khoa" name="specialty" valuePropName="specialty" rules={[{ required: true, message: "Chuyên khoa" }]} >
                    <Select value={'doctor'} onChange={handleUserTypeChange}>
                        <Select.Option value="doctor">Bác sĩ</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Địa chỉ" />
                </Form.Item>

                <Form.Item name="birthday" label="Ngày sinh" >
                    <DatePicker format="DD/MM/YYYY" placeholder="Ngày sinh" maxDate={dayjs().subtract(18, "year") as any} />
                </Form.Item>


                <Form.Item name="bio" label="Tiểu sử">
                    <Input placeholder="Tiểu sử bác sĩ" />
                </Form.Item>

 

            </Form>
        </Modal>
    );
}

export default ModalCreateUser;