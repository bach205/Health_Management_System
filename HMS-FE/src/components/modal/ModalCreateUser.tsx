import { DatePicker, Form, Input, Modal, Select, Checkbox, type FormInstance } from "antd";
import { useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../constants/user.const";
import type { IUserBase } from "../../types/index.type";
import dayjs from "dayjs";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
}

const ModalCreateUser = ({ role, isVisible, handleOk, handleCancel, form }: IProps) => {
  const [specialty, setSpecialty] = useState<string>("internal");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  return (
    <Modal
      open={isVisible}
      title={`Thêm ${TYPE_EMPLOYEE_STR[role]}`}
      onOk={handleOk}
      okText="Thêm"
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered
    >
      <Form
        name="addUserForm"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 20 }}
        initialValues={{ gender: "male" }}
      >
        <Form.Item
          label="Họ tên"
          name="full_name"
          rules={[
            { required: true, message: "Vui lòng nhập họ tên!" },
            { max: 25, message: "Họ tên không được vượt quá 25 ký tự!" }
          ]}
        >
          <Input placeholder={`Họ tên ${TYPE_EMPLOYEE_STR[role]}`} maxLength={25} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, type: "email", message: "Vui lòng nhập đúng format!" },
            { max: 50, message: "Email không được vượt quá 50 ký tự!" }
          ]}
        >
          <Input placeholder={`Email ${TYPE_EMPLOYEE_STR[role]}`} maxLength={50} />
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
            { max: 20, message: "Số điện thoại không được vượt quá 20 ký tự!" }
          ]}
        >
          <Input placeholder={`Số điện thoại ${TYPE_EMPLOYEE_STR[role]}`} maxLength={20} />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select style={{ width: 100 }}>
            <Select.Option value="male">Nam</Select.Option>
            <Select.Option value="female">Nữ</Select.Option>
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
                options={specialtyOptions}
              />
            </Form.Item>

            <Form.Item name="bio" label="Tiểu sử">
              <Input placeholder="Tiểu sử bác sĩ" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[
            { max: 200, message: "Địa chỉ không được vượt quá 200 ký tự!" }
          ]}
        >
          <Input placeholder="Địa chỉ" maxLength={200} />
        </Form.Item>

        <Form.Item name="date_of_birth" label="Ngày sinh">
          <DatePicker
            format="DD/MM/YYYY"
            placeholder="Ngày sinh"
            maxDate={dayjs().subtract(18, "year") as any}
          />
        </Form.Item>

        <Form.Item name="create_password" label="Tạo mật khẩu" valuePropName="checked">
          <Checkbox onChange={(e) => setShowPasswordFields(e.target.checked)}>
            Tạo mật khẩu ngay
          </Checkbox>
        </Form.Item>

        {showPasswordFields && (
          <>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Xác nhận"
              name="confirm_password"
              dependencies={['password']}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ModalCreateUser;
