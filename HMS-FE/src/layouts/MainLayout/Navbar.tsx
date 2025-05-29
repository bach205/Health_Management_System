import React, { useState } from "react";
import { assets } from "../../assets/assets.ts";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [token, setToken] = useState<boolean>(true);

  return (
    <div className="flex items-center justify-between text-sm py-4 px-5 mb-5 border-b border-b-gray-400">
      <div className="flex-1">
        <img
          onClick={() => navigate("/")}
          className="w-44 cursor-pointer"
          src={assets.logo}
          alt="logo"
        />
      </div>
      <ul className="flex-1 hidden md:flex justify-center items-start gap-5 font-medium">
        <NavLink to="/">
          <li className="py-1 font-bold">Trang Chủ</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/doctors">
          <li className="py-1 font-bold">Bác Sĩ</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/about">
          <li className="py-1 font-bold">Về Chúng Tôi</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
        <NavLink to="/contact">
          <li className="py-1 font-bold">Liên Hệ</li>
          <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
        </NavLink>
      </ul>
      <div className="flex-1 flex items-center gap-4 justify-end">
        {token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-8 rounded-full"
              src={assets.profile_pic}
              alt="hồ sơ cá nhân"
            />
            <img className="w-2.5" src={assets.dropdown_icon} alt="mở rộng" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => navigate("my-profile")}
                  className="hover:text-black cursor-pointer"
                >
                  Hồ sơ của tôi
                </p>
                <p
                  onClick={() => navigate("my-appointments")}
                  className="hover:text-black cursor-pointer"
                >
                  Lịch hẹn của tôi
                </p>
                <p
                  onClick={() => setToken(false)}
                  className="hover:text-black cursor-pointer"
                >
                  Đăng xuất
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-[#5f6fff] text-white px-8 py-3 rounded-full font-light hidden md:block hover:cursor-pointer hover:bg-[#5f6fffd5] transition-all duration-300"
          >
            Tạo tài khoản
          </button>
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="menu"
        />
        {/*-------Mobile Menu------------*/}
        <div
          className={`${showMenu ? "fixed w-full" : "h-0 w-0"
            } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all'`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="logo" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt="close"
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">Trang Chủ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">Bác Sĩ</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">Về Chúng Tôi</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">Liên Hệ</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
