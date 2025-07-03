// components/modal/ModalCreateMedicine.tsx
import { Form, Input, InputNumber, Modal, type FormInstance } from "antd";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
}

const ModalCreateMedicine = ({ isVisible, handleOk, handleCancel, form }: IProps) => {
  return (
    <Modal
      open={isVisible}
      title="Thêm thuốc"
      onOk={handleOk}
      okText="Thêm"
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered
    >
      <Form
        name="addMedicineForm"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 20 }}
        initialValues={{ stock: 0, price: 0 }}
      >
        <Form.Item
          label="Tên thuốc"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên thuốc!", whitespace: true },
            { max: 100, message: "Tên thuốc không được quá 100 ký tự!" }
          ]}
        >
          <Input placeholder="Nhập tên thuốc" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="stock"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng!" },
            { type: "number", min: 0, message: "Số lượng không hợp lệ!" }
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item
          label="Giá tiền"
          name="price"
          rules={[
            { required: true, message: "Vui lòng nhập giá!" },
            { type: "number", min: 0, message: "Giá tiền không hợp lệ!" }
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCreateMedicine;
