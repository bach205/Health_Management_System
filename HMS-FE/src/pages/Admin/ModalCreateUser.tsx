import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useState } from "react";
import type { EmployeeType } from "../../utils";
import dayjs from "dayjs";

interface IProps {
    isVisible: boolean,
    handleOk: () => void,
    handleCancel: () => void,
    form: FormInstance
    // specialtyOptions: any
}
const ModalCreateUser = ({  isVisible, handleOk, handleCancel, form }: IProps) => {
      
  const specialtyOptions = [
    { value: "internal", label: "Nội khoa" },
    { value: "surgery", label: "Ngoại khoa" },
    { value: "pediatrics", label: "Nhi khoa" },
    { value: "cardiology", label: "Tim mạch" },
    { value: "dermatology", label: "Da liễu" },
  ];
  
    const [specialty, setSpecialty] = useState<string>("internal");

    const [isShowSpecialty, setIsShowSpecialty] = useState(false);

    const handleroleChange = (value: EmployeeType) => {
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

                <Form.Item label="Họ tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!", },]} >
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
                    {/* <Select value={'doctor'} onChange={handleroleChange}>
                        <Select.Option value="doctor">Bác sĩ</Select.Option>
                    </Select> */}
                    <Select
                        style={{ width: 120 }}
                        value={specialty}
                        onChange={(value) => setSpecialty(value)}
                        options={specialtyOptions}
                    />
                </Form.Item>
                <Form.Item name="address" label="Địa chỉ">
                    <Input placeholder="Địa chỉ" />
                </Form.Item>

                <Form.Item name="date_of_birth" label="Ngày sinh" >
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