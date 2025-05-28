import React, { useEffect, useState } from "react";
import { Form, notification } from "antd";
import ModalEditProfile from "../../components/modal/ModalEditProfile";
import dayjs from "dayjs";
import type { IPatient } from "../../types/index.type";
import { assets } from "../../assets/assets";
import { updateProfile } from "../../services/patient.service";

const MyProfile: React.FC = () => {
  const [userData, setUserData] = useState<IPatient>({} as IPatient);
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  const [form] = Form.useForm();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleOk = async () => {
    try {
      await form.validateFields();
      const value = form.getFieldsValue();
      const updateData = {
        full_name: value.full_name,
        email: value.email,
        address: value.address,
        phone: value.phone,
        gender: value.gender,
        identity_number: value.identity_number,
      }
      // console.log(value);
      setIsVisible(false);
      await updateProfile({ id: userData.id, updateData, });
      notification.success({ message: "Cập nhật thông tin thành công" });
      setIsVisible(false);
    } catch (error: any) {
      if (error?.errorFields?.length > 0) {
        notification.error({ message: error.errorFields[0].errors[0] });
      }
      else {
        notification.error({ message: "Có lỗi xảy ra" });
      }
    }
  }
  const handleCancel = () => {
    setIsVisible(false);
  }
  const handleUpdate = () => {
    setIsVisible(true);
    try {
      form.setFieldsValue({
        ...userData,
        date_of_birth: userData.date_of_birth ? dayjs(userData.date_of_birth) : null,
      });
      setIsVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  }
  return (
    <div className="max-w-lg flex mx-auto flex-col gap-2 text-sm">
      <img className="w-36 rounded" src={assets.profile_pic} alt="profile" />

      <p className="font-medium text-3xl text-neutral-800 mt-4">
        {userData.full_name || "Không có tên"}
      </p>

      <hr className="bg-zinc-400 h-[1px] border-none" />
      <div>
        <p className="text-neutral-500 underline mt-3">Thông tin liên hệ</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Email:</p>
          <p className="text-blue-500">{userData.email || "Không có email"}</p>
          <p className="font-medium">Số điện thoại:</p>

          <p className="text-blue-400">{userData.phone || "Không có số điện thoại"}</p>
          <p className="font-medium">Địa chỉ:</p>

          <p className="text-gray-500">
            {userData.address || "Không có địa chỉ"}
          </p>

        </div>
      </div>
      <div>
        <p className="text-neutral-500 underline mt-3">THÔNG TIN CƠ BẢN</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Giới tính:</p>

          <p className="text-gray-400">{userData.gender || "Không có giới tính"}</p>
          <p className="font-medium">Ngày sinh:</p>
          <p className="text-gray-400">{userData.date_of_birth || "Không có ngày sinh"}</p>
          <p className="font-medium">Số CMND:</p>
          <p className="text-gray-400">{userData.identity_number || "Không có số CMND"}</p>
        </div>
      </div>
      <div className="mt-10">
        <button
          className="border cursor-pointer border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
          onClick={() => handleUpdate()}
        >
          Cập nhật thông tin
        </button>
      </div>
      <ModalEditProfile isVisible={isVisible} handleOk={handleOk} handleCancel={handleCancel} form={form} />
    </div>
  );
};

export default MyProfile;
