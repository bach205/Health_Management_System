import { Avatar, DatePicker, Flex, Form, Image, Input, Modal, Select, type FormInstance } from "antd";
import { useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../constants/user.const";
import type { IUserBase } from "../../types/index.type";
import dayjs from "dayjs";
import Rating from "../../pages/Patient/Rating";
import { useSpecialtyList } from "../../hooks/useSpecialtyList";
interface IProps {
  isVisible: boolean;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
  user?: any;
}

const ModalViewUser = ({ role, isVisible, handleCancel, form, user }: IProps) => {
  const [specialty, setSpecialty] = useState<string>("internal");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  // console.log(user);

  const { specialties, loading: specialtyLoading, reload: specialtyReload, handleTableChange: specialtyTableChange } = useSpecialtyList(undefined, true);
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
      {/* <Avatar src={user.avatar} size={100} /> */}
      {/* FLex */}

      <Flex justify="center" align="center">
        {user?.avatar &&
          <Image
            className="max-h-[200px] max-w-[200px]"
            src={user?.avatar ? user.avatar : 'error'}
            fallback="data:image/png;base64,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"
          />
        }
      </Flex>
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
            <Select.Option value="other"><span className="text-black">Khác</span></Select.Option>
          </Select>
        </Form.Item>
        {
          role === "patient" && (
            <Form.Item name="identity_number" label="Số định danh" >
              <Input placeholder="Số Định danh" className="text-black!" maxLength={12} />
            </Form.Item>
          )
        }

        {role === "doctor" && (
          <>
            <Form.Item

              label="Khoa"
              name="specialty"
              rules={[{ required: true, message: "Vui lòng chọn chuyên khoa!" }]}
            >
              <Select
                style={{ width: 120 }}
                value={user?.doctor?.specialty?.name}
                onChange={(value) => setSpecialty(value)}
              >
                {specialties.map((specialty) => (
                  <Select.Option key={specialty.id} value={specialty.name}>
                    <span className="text-black">{specialty.name}</span>
                  </Select.Option>
                ))}
              </Select>

            </Form.Item>

            <Form.Item
              name="bio" label="Tiểu sử">
              <Input className="text-black!" placeholder="Tiểu sử bác sĩ" />
            </Form.Item>
            <Form.Item label="Đánh giá">
              <Rating rating={user?.doctor?.rating || 0} />
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
