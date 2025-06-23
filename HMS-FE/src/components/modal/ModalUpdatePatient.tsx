import { Button, DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useEffect, useState } from "react";
import { specialtyOptions, TYPE_EMPLOYEE_STR } from "../../constants/user.const";
import type { IUserBase } from "../../types/index.type";
import dayjs from "dayjs";
import Uploader from "../../pages/Profile/Uploader";

interface IProps {
  isVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  form: FormInstance;
  role: IUserBase["role"];
  user: any;
  reload: boolean;
  setReload: (reload: boolean) => void;
}

const ModalUpdatePatient = ({ role, isVisible, handleOk, handleCancel, form, user, reload, setReload }: IProps) => {
  const handleReload = () => {
    handleCancel();
    setReload(!reload);
  }
  const [identityType, setIdentityType] = useState<string>("citizen");
  return (
    <Modal
      open={isVisible}
      title={`Cập nhật ${TYPE_EMPLOYEE_STR[role]}`}
      onOk={handleOk}
      okText={"Cập nhật"}
      cancelText="Hủy"
      onCancel={handleCancel}
      destroyOnHidden
      centered

    >
      <Uploader
        user={user}
        reload={reload}
        setReload={handleReload}
      ></Uploader>
      <Form
        name="updateUserForm"
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
            { required: true, type: "email", message: "Vui lòng nhập đúng format email!" },
            { max: 50, message: "Email không được vượt quá 50 ký tự!" }
          ]}
        >
          <Input disabled={true} placeholder={`Email ${TYPE_EMPLOYEE_STR[role]}`} maxLength={50} />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            // { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: new RegExp(/^\d{10}$/), message: "Số điện thoại không hợp lệ!" },
            { max: 10, message: "Số điện thoại không được vượt quá 10 ký tự!" }
          ]}
        >
          <Input placeholder={`Số điện thoại ${TYPE_EMPLOYEE_STR[role]}`} maxLength={20} />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
        // rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select style={{ width: 100 }}>
            <Select.Option value="male"><span className="text-black">Nam</span></Select.Option>
            <Select.Option value="female"><span className="text-black">Nữ</span></Select.Option>
            <Select.Option value="other"><span className="text-black">Khác</span></Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input placeholder="Địa chỉ" />
        </Form.Item>

        <Form.Item name="date_of_birth" label="Ngày sinh">
          <DatePicker format="DD/MM/YYYY" placeholder="Ngày sinh" maxDate={dayjs()} />
        </Form.Item>
        <Form.Item
          name="identity_type"
          label="Loại định danh"
          initialValue="citizen"
        >
          <Select onChange={(value) => setIdentityType(value)} style={{ width: "100%" }}>
            <Select.Option value="passport"><span className="text-black">Chứng minh nhân dân</span></Select.Option>
            <Select.Option value="citizen"><span className="text-black">Căn cước công dân</span></Select.Option>
          </Select>
        </Form.Item>

        {identityType === "citizen" ? (
          <Form.Item name="identity_number" label="Số CCCD"
            rules={[
              { pattern: new RegExp(/^\d{12}$/), message: "Số CCCD không hợp lệ!", whitespace: true }
            ]}
          >
            <Input placeholder="Số CCCD" maxLength={12} />
          </Form.Item>
        ) : (
          <Form.Item name="identity_number" label="Số CMND"

            rules={[
              { pattern: new RegExp(/^\d{9}(\d{3})?$/), message: "Số CMND không hợp lệ!", whitespace: true }
            ]}
          >
            <Input placeholder="Số CMND" maxLength={12} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ModalUpdatePatient;
