import { DatePicker, Form, Input, Modal, Select, Checkbox, type FormInstance } from "antd";
import { useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../constants/user.const";
import dayjs from "dayjs";
// import dayjs from "dayjs";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
}

const TransferRoomModal = ({ isVisible, handleOk, handleCancel, form }: IProps) => {
    const [specialty, setSpecialty] = useState<string>("internal");

    return (
        <Modal
            open={isVisible}
            title={`Lệnh chuyển phòng`}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
            onCancel={handleCancel}
            destroyOnHidden
            centered
            width={800}
        >
            <Form
                name="examinationForm"
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                style={{ marginTop: 20 }}
                initialValues={{ gender: "male" }}
            >
                <Form.Item label="Khoa" name="department" rules={[{ required: true, message: "Vui lòng chọn khoa" }]}>
                    <Select options={[]} />
                </Form.Item>
                <Form.Item label="Chuyển đến phòng" name="to_clinic_id" rules={[{ required: true, message: "Vui lòng chọn phòng" }]}>
                    <Select options={[]} />
                </Form.Item>
                <Form.Item label="Chuẩn đoán sơ bộ" name="result" rules={[{ required: true, message: "Vui lòng nhập chuẩn đoán sơ bộ" }]}>
                    <Input.TextArea placeholder="Chuẩn đoán sơ bộ" />
                </Form.Item>
                <Form.Item label="Ghi chú" name="note" rules={[{ required: true, message: "Vui lòng nhập lý do" }]}>
                    <Input.TextArea placeholder="Ghi chú" />
                </Form.Item>
            </Form>
        </Modal>
    );
};



export default TransferRoomModal;