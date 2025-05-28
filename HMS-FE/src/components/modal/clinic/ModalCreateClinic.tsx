import { DatePicker, Form, Input, Modal, Select, Checkbox, type FormInstance } from "antd";

import type { IUserBase } from "../../../types/index.type";


interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
}

const ModalCreateClinic = ({ isVisible, handleOk, handleCancel, form }: IProps) => {


  return (
    <Modal
      open={isVisible}
      title={`Thêm phòng khám`}
      onOk={handleOk}
      okText="Thêm"
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered
    >
      <Form
        name="addClinicForm"
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

export default ModalCreateClinic;
