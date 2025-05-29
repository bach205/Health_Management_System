import { Form, Input, Modal, TimePicker, type FormInstance } from "antd";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
}

const ModalCreateShift = ({ isVisible, handleOk, handleCancel, form }: IProps) => {

    return (
        <Modal
            open={isVisible}
            title={`Thêm ca làm việc`}
            onOk={handleOk}
            okText="Thêm"
            cancelText="Hủy"
            onCancel={handleCancel}
            destroyOnHidden
            centered
        >
            <Form
                name="addShiftForm"
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                style={{ marginTop: 20 }}
                initialValues={{ gender: "male" }}
            >
                <Form.Item name="name" label="Tên ca làm việc" rules={[{ required: true, message: "Tên ca làm việc là bắt buộc" }]}>
                    <Input placeholder="Tên ca làm việc" />
                </Form.Item>

                <Form.Item name="start_time" label="Bắt đầu" rules={[{ required: true, message: "Thời gian bắt đầu là bắt buộc" }]}>
                    <TimePicker
                        placeholder="Bắt đầu"
                        format="HH:mm"
                    />
                </Form.Item>

                <Form.Item name="end_time" label="Kết thúc" rules={[{ required: true, message: "Thời gian kết thúc là bắt buộc" }]}>
                    <TimePicker
                        placeholder="Kết thúc"
                        format="HH:mm"
                    />
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default ModalCreateShift;
