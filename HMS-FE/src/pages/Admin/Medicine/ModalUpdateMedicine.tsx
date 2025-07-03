import { Modal, Input, InputNumber, Form, type FormInstance } from "antd";
import { useState } from "react";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  medicine: any;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

const ModalUpdateMedicine = ({ isVisible, handleOk, handleCancel, form }: IProps) => {
  return (
    <Modal
      open={isVisible}
      title="Cập nhật thuốc"
      onOk={handleOk}
      okText="Cập nhật"
      cancelText="Hủy"
      onCancel={handleCancel}
      centered
      destroyOnHidden
    >
      <Form
        name="updateMedicineForm"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 20 }}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Tên thuốc"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên thuốc!" },
            { max: 255, message: "Tên thuốc không được vượt quá 255 ký tự!" }
          ]}
        >
          <Input placeholder="Tên thuốc" />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="stock"
          rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Giá tiền"
          name="price"
          rules={[
            { required: true, message: "Vui lòng nhập giá tiền!" },
          ]}
        >
          <InputNumber min={100} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalUpdateMedicine;
