import { Form, Input, Modal, type FormInstance } from "antd";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
}
const EditExaminationModal = ({ isVisible, handleOk, handleCancel, form }: IProps) => {
    return (

        <Modal
            open={isVisible}
            title={`Điền kết quả khám bệnh`}
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


                <Form.Item
                    label="Kết quả"
                    name="result"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập kết quả khám bệnh",
                        },
                    ]}
                >
                    <Input.TextArea required placeholder="Nhập nhập kết quả khám bệnh" />
                </Form.Item>

                <Form.Item label="Chuẩn đoán sơ bộ" name="preliminaryDiagnosis">
                    <Input.TextArea placeholder="Nhập chuẩn đoán sơ bộ" />
                </Form.Item>

                <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea placeholder="Nhập Ghi chú" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default EditExaminationModal;