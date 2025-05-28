import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../constants/user.const";
import type { IUserBase } from "../../types/index.type";
import dayjs from "dayjs";

interface IProps {
  isVisible: boolean;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
}

const ModalViewUser = ({ role, isVisible, handleCancel, form }: IProps) => {
  const [specialty, setSpecialty] = useState<string>("internal");
  return (
    <Modal
      open={isVisible}
      title={`Thông tin ${TYPE_EMPLOYEE_STR[role]}`}
      cancelText="Đóng"
      footer={null}
      onCancel={handleCancel}
      destroyOnHidden
      centered
    >
      <Form
        name="addUserForm"
        disabled
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 20 }}
        initialValues={{ gender: "male" }}
      >
        <Form.Item
          label="Họ tên"
          name="full_name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
        >
          <Input className="text-black!" placeholder={`Họ tên ${TYPE_EMPLOYEE_STR[role]}`} />
        </Form.Item>

        <Form.Item

          label="Email"
          name="email"
          rules={[
            { required: true, type: "email", message: "Vui lòng nhập đúng format!" },
          ]}
        >
          <Input className="text-black!" placeholder={`Email ${TYPE_EMPLOYEE_STR[role]}`} />
        </Form.Item>

        <Form.Item

          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            {
              pattern: /^\d{10,12}$/,
              message: "Số điện thoại không hợp lệ!",
            },
          ]}
        >
          <Input className="text-black!" placeholder={`Số điện thoại ${TYPE_EMPLOYEE_STR[role]}`} />
        </Form.Item>

        <Form.Item

          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select style={{ width: 100 }}>
            <Select.Option value="male"><span className="text-black">Nam</span></Select.Option>
            <Select.Option value="female"><span className="text-black">Nữ</span></Select.Option>
          </Select>
        </Form.Item>

        {role === "doctor" && (
          <>
            <Form.Item

              label="Khoa"
              name="specialty"
              rules={[{ required: true, message: "Vui lòng chọn chuyên khoa!" }]}
            >
              <Select
                style={{ width: 120 }}
                value={specialty}
                onChange={(value) => setSpecialty(value)}
              >
                {specialtyOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    <span className="text-black">{option.label}</span>
                  </Select.Option>
                ))}
              </Select>

            </Form.Item>

            <Form.Item
              name="bio" label="Tiểu sử">
              <Input className="text-black!" placeholder="Tiểu sử bác sĩ" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="address" label="Địa chỉ">
          <Input className="text-black!" placeholder="Địa chỉ" />
        </Form.Item>

        <Form.Item
          name="date_of_birth" label="Ngày sinh">
          <DatePicker
            format="DD/MM/YYYY"
            className="text-black!" placeholder="Ngày sinh"
            maxDate={dayjs().subtract(18, "year") as any}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalViewUser;
