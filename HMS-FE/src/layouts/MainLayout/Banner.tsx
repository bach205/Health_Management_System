import React from "react";
import { assets } from "../../assets/assets.ts";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.ts";

const Banner: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return (
    <div className="flex bg-[#5f6fff] rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10">
      {/*------------Left Side-------- */}
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white">
          <p>Đặt lịch hẹn</p>
          <p className="mt-4">Với hơn 100 bác sĩ đáng tin cậy</p>
        </div>
        {user ? (
          <button
            onClick={() => {
              navigate("/doctors");
              scrollTo(0, 0);
            }}
            className="cursor-pointer bg-white text-sm sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all"
          >
            Đặt lịch hẹn
          </button>
        ) : (
          <button
            onClick={() => {
              navigate("/login");
              scrollTo(0, 0);
            }}
            className="bg-white text-sm sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all"
          >
            Đăng nhập
          </button>
        )}
      </div>
      {/*--------------Right Side-------------------- */}
      <div className="hidden md:block md:w-1/2 lg:w-[370px] relative">
        <img
          className="w-full absolute bottom-0 right-0 max-w-md"
          src={assets.appointment_img}
          alt="đặt lịch hẹn"
        />
      </div>
    </div>
  );
};

export default Banner;
