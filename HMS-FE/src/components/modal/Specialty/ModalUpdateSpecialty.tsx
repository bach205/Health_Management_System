import { Form, Input, Modal, notification, type FormInstance } from "antd";
import { useEffect } from "react";
import type { ISpecialty } from "../../../types/index.type";
import { updateSpecialty } from "../../../services/specialty.service";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  currentSpecialty: ISpecialty | null;
  onUpdated: () => void; // gọi để reload list sau khi cập nhật
}

const ModalUpdateSpecialty = ({
  isVisible,
  handleOk,
  handleCancel,
  form,
  currentSpecialty,
  onUpdated,
}: IProps) => {
  useEffect(() => {
    if (isVisible && currentSpecialty) {
      form.setFieldsValue({ name: currentSpecialty.name });
    }
  }, [isVisible, currentSpecialty, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.name = values.name.trim(); 
      if (!currentSpecialty) return;  

      await updateSpecialty(values, currentSpecialty.id);
      notification.success({ message: "Cập nhật chuyên khoa thành công" });
      form.resetFields();
      handleOk();
      onUpdated(); // trigger reload
    } catch (error: any) {
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
      title="Chỉnh sửa chuyên khoa"
      onOk={handleSubmit}
      okText="Cập nhật"
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
        name="updateSpecialtyForm"
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

export default ModalUpdateSpecialty;
