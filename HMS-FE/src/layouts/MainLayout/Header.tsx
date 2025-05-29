import React from "react";
import { assets } from "../../assets/assets.ts";

const Header: React.FC = () => {
  return (
    <div className="containter flex flex-col md:flex-row flex-wrap bg-[#5f6fff]  px-6 md:px-10 lg:px-20">
      {/*------------------------Left Side------------------------------------ */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
          Đặt Lịch Hẹn <br /> Với Bác Sĩ Tin Cậy
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light ">
          <img
            className="w-28"
            src={assets.group_profiles}
            alt="hình ảnh nhóm bác sĩ"
          />
          <p>
            Dễ dàng duyệt qua danh sách bác sĩ đáng tin cậy của chúng tôi,
            <br className="hidden sm:block" /> đặt lịch hẹn một cách dễ dàng.
          </p>
        </div>
        <a
          href="#speciality"
          className="flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300"
        >
          Đặt lịch hẹn
          <img className="w-3" src={assets.arrow_icon} alt="mũi tên" />
        </a>
      </div>
      {/*------------------------Right Side ------------------------------ */}
      <div className="md:w-1/2 relative">
        <img
          className="w-full md:absolute bottom-0 h-auto rounded-lg"
          src={assets.header_img}
          alt="hình ảnh bác sĩ và bệnh nhân"
        />
      </div>
    </div>
  );
};

export default Header;
