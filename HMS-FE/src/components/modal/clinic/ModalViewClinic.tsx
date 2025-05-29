import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import type { IUserBase } from "../../../types/index.type";

interface IProps {
  isVisible: boolean;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
}

const ModalViewClinic= ({ isVisible, handleCancel, form, }: IProps) => {


  return (
    <Modal
      open={isVisible}
      title={`Thông tin Phòng Khám`}
      cancelText="Đóng"
      footer={null}
      onCancel={handleCancel}
      destroyOnHidden
      centered
    >
      <Form
        name="viewClinicForm"
        disabled
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

export default ModalViewClinic;
