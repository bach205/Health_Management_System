import React from "react";
import { assets } from "../../assets/assets";

const Contact: React.FC = () => {
  return (
    <div >
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          LIÊN HỆ
        </p>
      </div>
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.contact_image}
          alt="liên hệ"
        />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-lg text-gray-600">VĂN PHÒNG CỦA CHÚNG TÔI</p>
          <p className="text-gray-500">
            Bệnh viện Đa khoa Hà Nội,
            <br />
            Đường Nguyễn Văn Cừ, Hà Nội
          </p>
          <p className="text-gray-500">
            Điện thoại: 0909090909 <br />
            Email: benhvien@gmail.com
          </p>


        </div>
      </div>
    </div>
  );
};

export default Contact;
