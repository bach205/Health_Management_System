import { Form, Input, Modal, Select, type FormInstance } from "antd";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
}

const ModalUpdateUser = ({  isVisible, handleOk, handleCancel, form }: IProps) => {

  return (
    <Modal
      open={isVisible}
      title={`Cập nhật Phòng Khám`}
      onOk={handleOk}
      okText={"Cập nhật"}
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered

    >
      <Form
        name="updateClinicForm"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="Tên Phòng"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên của phòng khám!" }]}
        >
          <Input placeholder={`Tên phòng khám`} />
        </Form.Item>

        <Form.Item
          label="Thông tin"
          name="description"
          rules={[
            { required: true, type: "string", message: "Vui lòng nhập thông tin giới thiệu phòng khám!" },
          ]}
        >
          <Input placeholder={`Thông tin phòng khám`} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUpdateUser;
