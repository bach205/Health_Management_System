import { Form, Input, Modal, notification, type FormInstance } from "antd";
import { createSpecialty } from "../../../services/specialty.service";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  onCreated: () => void; // dùng để reload danh sách
}

const ModalCreateSpecialty = ({
  isVisible,
  handleOk,
  handleCancel,
  form,
  onCreated,
}: IProps) => {
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.name = values.name.trim(); // 

      await createSpecialty(values);
      notification.success({ message: "Thêm chuyên khoa thành công" });
      form.resetFields();
      handleOk();
      onCreated(); // reload list
    } catch (error: any   ) {
      console.log("error", error)
      if (error?.response?.data) {
        notification.error({ message: error.response.data.message });
      } else if (error?.errorFields?.length > 0) {
        notification.error({ message: error.errorFields[0].errors[0] });
      } else {
        notification.error({ message: "Có lỗi xảy ra" });
      }
    }
  };

  return (
    <Modal
      open={isVisible}
      title="Thêm chuyên khoa"
      onOk={handleSubmit}
      okText="Thêm"
      cancelText="Hủy"
      onCancel={() => {
        form.resetFields();
        handleCancel();
      }}
      destroyOnHidden
      width={600}
      centered
    >
      <Form
        name="addSpecialtyForm"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="Tên chuyên khoa"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên chuyên khoa!", whitespace: true },
            { max: 100, message: "Tên chuyên khoa không được vượt quá 100 ký tự!" }
          ]}
        >
          <Input placeholder="Nhập tên chuyên khoa" maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCreateSpecialty;
