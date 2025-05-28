import React from "react";
import { assets } from "../../assets/assets.ts";

const Footer: React.FC = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/*---------------Left Section--------------------*/}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="logo" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Prescripto là nền tảng đặt lịch hẹn với bác sĩ đáng tin cậy. Chúng tôi cam kết mang đến trải nghiệm chăm sóc sức khỏe tốt nhất cho bạn và gia đình.
          </p>
        </div>
        {/*---------------Center Section--------------------*/}
        <div>
          <p className="text-xl font-medium mb-5">CÔNG TY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Trang Chủ</li>
            <li>Về Chúng Tôi</li>
            <li>Liên Hệ</li>
            <li>Chính Sách Bảo Mật</li>
          </ul>
        </div>
        {/*---------------Right Section--------------------*/}
        <div>
          <p className="text-xl font-medium mb-5">LIÊN HỆ</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>8095381183</li>
            <li>anils.pvg1234@gmail.comk</li>
          </ul>
        </div>
      </div>
      {/*--------------Copyright Text------------------- */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Bản quyền 2024@ Prescripto - Đã đăng ký bản quyền.
        </p>
      </div>
    </div>
  );
};

export default Footer;
