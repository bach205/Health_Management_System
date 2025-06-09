import { Flex, Input, DatePicker, Select, Button, Typography, Form, notification } from "antd";
import { useState, useEffect } from "react";
import { getProfile, updatePassword, updateProfile } from "../../services/patient.service";
import ModalEditPassword from "../../components/modal/ModalEditPassword";
import dayjs from "dayjs";

const DoctorProfile = () => {
    const [profile, setProfile] = useState<any>({} as any);
    const [reload, setReload] = useState<boolean>(false);
    const [isVisiblePassword, setIsVisiblePassword] = useState(false);
    const [formPassword] = Form.useForm();

    useEffect(() => {
        fetchProfile()
    }, [reload]);

    const fetchProfile = async () => {
        try {
            const res = await getProfile()
            console.log(res)
            if (res.data.success) {
                // setUserData(res.data.user)
                setProfile(res.data.user)
            }
        } catch (error) {
            console.log(error)
            notification.error({ message: "Có lỗi xảy ra" })
        }
    }
    const [formProfile] = Form.useForm();
    const [isVisibleProfile, setIsVisibleProfile] = useState<boolean>(false);
  
    const handleOkProfile = async () => {
      try {
        await formProfile.validateFields();
        const value = formProfile.getFieldsValue();
        const updateData = {
          full_name: value.full_name,
          email: value.email,
          address: value.address,
          phone: value.phone,
          gender: value.gender,
          identity_number: value.identity_number,
          date_of_birth: value.date_of_birth,
        }
        // console.log(value);
        setIsVisibleProfile(false);
        console.log(updateData)
        await updateProfile({ userId: profile.id, updateData, });
        notification.success({ message: "Cập nhật thông tin thành công" });
        setReload(!reload);
        setIsVisibleProfile(false);
      } catch (error: any) {
        if (error?.response?.data?.errors) {
          notification.error({ message: error.response.data.errors[0] });
        }else if (error?.response?.data?.message) {
          notification.error({ message: error.response.data.message });
        }
        else if (error?.errorFields?.length > 0) {
          notification.error({ message: error.errorFields[0].errors[0] });
        }
        else {
          notification.error({ message: "Có lỗi xảy ra" });
        }
      }
    }
    const handleCancelProfile = () => {
      setIsVisibleProfile(false);
    }
    const handleUpdate = () => {
      setIsVisibleProfile(true);
      try {
        formProfile.setFieldsValue({
          ...profile,
          gender: profile.gender || "male",
          date_of_birth: profile.date_of_birth ? dayjs(profile.date_of_birth) : null,
          identity_number: profile.patient?.identity_number || "",
        });
        setIsVisibleProfile(true);
      } catch (error) {
        console.log(error);
        notification.error({ message: "Có lỗi xảy ra" });
      }
    }
    const handleUpdatePassword = () => {
      setIsVisiblePassword(true);
  
    }
    const handleOkPassword = async () => {
      try {
        await formPassword.validateFields();
        const value = formPassword.getFieldsValue();
        const updateData = {
          token: localStorage.getItem("token"),
          newPassword: value.newPassword,
          confirmPassword: value.confirmPassword,
        }
        await updatePassword(updateData);
        notification.success({ message: "Cập nhật mật khẩu thành công" });
        setIsVisiblePassword(false);
      } catch (error: any) {
        console.log(error);
        if (error?.response?.data?.errors) {
          notification.error({ message: error.response.data.errors[0] });
        }
        else if (error?.errorFields?.length > 0) {
          notification.error({ message: error.errorFields[0].errors[0] });
        }
        else if (error?.response?.data?.message) {
          notification.error({ message: error.response.data.message });
        }
        else {
          notification.error({ message: "Có lỗi xảy ra" });
        }
      }
    }
    const handleCancelPassword = () => {
        setIsVisiblePassword(false);
    };
    return (
        <div style={{ padding: "20px" }}>
            <Typography.Title className="text-center" level={3}>Cập nhật tài khoản</Typography.Title>
            <Flex justify="center" align="center">
                <Form form={formProfile}
                    name="update-account"
                    style={{ width: 500 }}
                    labelCol={{ span: 6 }}
                    labelAlign="left"
                >
                    <Form.Item
                        label="Họ tên"
                        name="fullName"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập họ tên!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập email!",
                            },
                            { type: "email", message: "Vui lòng nhập đúng format!" },
                        ]}
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="birthday"
                        label="Ngày sinh"
                    >
                        <DatePicker format="DD/MM/YYYY" placeholder="Ngày sinh" maxDate={dayjs().subtract(18, "year")} />
                    </Form.Item>
                    <Form.Item
                        name="gender"
                        label="Giới tính"
                        initialValue={profile.gender || "other"}
                    >
                        <Select style={{ width: 100 }}>
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
                            <Select.Option value="other">Khác</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input placeholder="Địa chỉ" />
                    </Form.Item>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { pattern: new RegExp(/^\d{10}$/), message: "Số điện thoại không hợp lệ!" }
                        ]}
                    >
                        <Input placeholder="Số điện thoại" />
                    </Form.Item>

                    <Form.Item label="Chức vụ" name="userTypeStr">
                        <Input disabled />
                    </Form.Item>

                    <Form.Item >
                        <Flex justify="space-between">
                            <Button type="primary" htmlType="submit">
                                Cập nhật thông tin
                            </Button>
                            <Button type="default" onClick={() => setIsVisiblePassword(true)} >
                                Đổi mật khẩu
                            </Button>
                        </Flex>

                    </Form.Item>
                </Form>
            </Flex>
            <ModalEditPassword isVisible={isVisiblePassword} handleOk={handleOkPassword} handleCancel={handleCancelPassword} form={formPassword} />

        </div>
    );
}

export default DoctorProfile;