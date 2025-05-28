import { Link, useNavigate } from "react-router-dom";

import { register } from "../../services/auth.service";
import { useState } from "react";

const Register = () => {
  let navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [repassword, setRepassword] = useState<string>("");
  const [checkpassword, setCheckPassword] = useState<boolean>(false);
  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };

  const handlePhoneChange = (e: any) => {
    setPhone(e.target.value);
  };
  
  const handleRePasswordChange = (e: any) => {
    setRepassword(e.target.value);
    if(e.target.value !== password) {
      setCheckPassword(true);
    } else {
      setCheckPassword(false);
    }
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
    };
    const data = await register(values);
    if(data.data.message == 'Register successfully') {
      console.log("Đăng ký thành công");
      navigate("/login");
    } else {
      console.log("Đăng ký thất bại");
    }
  };

    
  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          Đăng Ký
        </p>
        <p>
          Xin mời đăng ký để đặt lịch hẹn
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={handleEmailChange}
            value={email}
            required
          />
        </div>
        <div className="w-full">
          <p>Mật khẩu</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={handlePasswordChange}
            value={password}
            required
          />
        </div>
        <div className="w-full">
          <p>Nhập lại mật khẩu</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={handleRePasswordChange}
            value={repassword}
            required
          />
        </div>
        {checkpassword ? 
          <p className="text-red-500 text-sm">
            Mật khẩu không khớp, vui lòng nhập lại
          </p>
        : ""}
        <div className="w-full">
          <p>Số điện thoại</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="text"
            onChange={handlePhoneChange}
            value={phone}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#5f6fff] hover:bg-[#5f6fffd5] text-white w-full py-2 rounded-md text-base"
        >
          Đăng Ký
        </button>
        <p>
          Đã có tài khoản?{" "}
        <span className="text-primary cursor-pointer hover:underline">
          <Link to="/login" className="text-primary hover:underline">Đăng Nhập</Link>         
        </span>
        </p>
      </div>
    </form>
  );
};

export default Register;