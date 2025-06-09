import { DatePicker, Form, Input, Modal, Select, Checkbox, type FormInstance } from "antd";
import { useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../constants/user.const";
import dayjs from "dayjs";
// import dayjs from "dayjs";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
}

const ExaminationModal = ({ isVisible, handleOk, handleCancel, form }: IProps) => {
  const [specialty, setSpecialty] = useState<string>("internal");

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



      </Form>
    </Modal>
  );
};



export default ExaminationModal;