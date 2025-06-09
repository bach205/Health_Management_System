import React, { useEffect, useState } from "react";
import { Form, notification } from "antd";
import ModalEditProfile from "../../components/modal/ModalEditProfile";
import dayjs from "dayjs";
import type { IPatient } from "../../types/index.type";
import { assets } from "../../assets/assets";
import { getProfile, updatePassword, updateProfile } from "../../services/patient.service";
import ModalEditPassword from "../../components/modal/ModalEditPassword";

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>({} as any);
  const [reload, setReload] = useState<boolean>(false);
  
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
  const [formPassword] = Form.useForm();
  const [isVisibleProfile, setIsVisibleProfile] = useState<boolean>(false);
  const [isVisiblePassword, setIsVisiblePassword] = useState<boolean>(false);

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
  }
  return (
    <div className="max-w-lg flex mx-auto flex-col gap-2 text-sm">

      {/* <img className="w-36 rounded" src={assets.profile_pic} alt="profile" /> */}

      <p className="font-medium text-3xl text-neutral-800 mt-4">
        {profile.full_name || "Không có tên"}
      </p>

      <hr className="bg-zinc-400 h-[1px] border-none" />
      <div>
        <p className="text-neutral-500 underline mt-3">Thông tin liên hệ</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500">{profile.email || "Không có email"}</p>
          <p className="font-medium">Số điện thoại:</p>

          <p className="">{profile.phone || "Không có số điện thoại"}</p>
          <p className="font-medium">Địa chỉ:</p>

          <p className="text-gray-500">
            {profile.address || "Không có địa chỉ"}
          </p>

        </div>
      </div>
      <div>
        <p className="text-neutral-500 underline mt-3">THÔNG TIN CƠ BẢN</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Giới tính:</p>

          <p className="text-gray-400">{profile.gender ? (profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác") : "Không có giới tính"}</p>
          <p className="font-medium">Ngày sinh:</p>
          <p className="text-gray-400">{profile.date_of_birth ? dayjs(profile.date_of_birth).format("DD/MM/YYYY") : "Không có ngày sinh"}</p>
          <p className="font-medium">Số CMND:</p>
            <p className="text-gray-400">{profile.patient?.identity_number || "Không có số CMND"}</p>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="mt-10">
          <button
            className="border cursor-pointer border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={() => handleUpdate()}
          >
            Cập nhật thông tin
          </button>
        </div>
        { profile.sso_provider === "local" && (
          <div className="mt-10">
            <button
              className="border cursor-pointer border-gray-500 px-8 py-2 rounded-full hover:bg-gray-500 hover:text-white transition-all"
            onClick={() => handleUpdatePassword()}
          >
            Thay đổi mật khẩu
          </button>
        </div>
        )}
      </div>
      <ModalEditProfile isVisible={isVisibleProfile} handleOk={handleOkProfile} handleCancel={handleCancelProfile} form={formProfile} />
      <ModalEditPassword isVisible={isVisiblePassword} handleOk={handleOkPassword} handleCancel={handleCancelPassword} form={formPassword} />
    </div>
  );
};

export default MyProfile;
