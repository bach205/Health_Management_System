import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../constants/user.const";
import type { IUserBase } from "../../types/index.type";
import dayjs from "dayjs";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
    role: IUserBase["role"];
}

const ModalUpdateAppointment = ({ role, isVisible, handleOk, handleCancel, form }: IProps) => {
    const [specialty, setSpecialty] = useState<string>("internal");
    return (
        <Modal
            open={isVisible}
            title={`Cập nhật lịch hẹn`}
            onOk={handleOk}
            okText={"Cập nhật"}
            cancelText="Hủy"
            onCancel={handleCancel}
            destroyOnHidden
            centered

        >
            <Form
                name="updateAppointmentForm"
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                style={{ marginTop: 20 }}
                initialValues={{ gender: "male" }}
            >
                <Form.Item
                    label="Chọn chuyên khoa"
                    name="specialty"
                    valuePropName="specialty"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn chuyên khoa!",
                        },
                    ]}
                >
                    <Select
                        style={{ width: 200, marginLeft: 10 }}
                        options={specialtyOptions}
                        value={specialty}
                    />
                </Form.Item>

                <Form.Item
                    label="Chọn bác sĩ"
                    name="doctor"
                    valuePropName="doctor"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn bác sĩ!",
                        },
                    ]}
                >
                    {/* <SelectDoctor onChange={handleChangeDoctor} specialty={specialty} /> */}
                    <Select style={{ width: 100 }}>
                        <Select.Option value="male"><span className="text-black">Nam</span></Select.Option>
                        <Select.Option value="female"><span className="text-black">Nữ</span></Select.Option>
                        <Select.Option value="other"><span className="text-black">Khác</span></Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Chọn ngày khám"
                    name="date"
                    valuePropName="date"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn ngày khám!",
                        },
                    ]}
                >
                    <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày khám" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalUpdateAppointment;
