import { Form, Input, Modal, TimePicker, type FormInstance } from "antd";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
}

const ModalUpdateShift = ({ isVisible, handleOk, handleCancel, form }: IProps) => {

  return (
    <Modal
      open={isVisible}
      title={`Cập nhật ca làm việc`}
      onOk={handleOk}
      okText="Cập nhật"
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered
    >
      <Form
        name="updateShiftForm"
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
          />
        </Form.Item>

        <Form.Item name="end_time" label="Kết thúc" rules={[{ required: true, message: "Thời gian kết thúc là bắt buộc" }]}>
          <TimePicker
            placeholder="Kết thúc"
          />
        </Form.Item>

      </Form>
    </Modal>
  );
};

export default ModalUpdateShift;
