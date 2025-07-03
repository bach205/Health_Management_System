import { Link, useNavigate } from "react-router-dom";

import { registerService } from "../../services/auth.service";
import { useState } from "react";
import { toast } from "react-toastify";
const Register = () => {
  let navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repassword, setRepassword] = useState<string>("");
  const [checkpassword, setCheckPassword] = useState<boolean>(false);
  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };
  const handleRePasswordChange = (e: any) => {
    setRepassword(e.target.value);
    if (e.target.value !== password) {
      setCheckPassword(false);
    } else {
      setCheckPassword(true);
    }
  };

  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "") {
      toast.error("Vui lòng nhập đầy đủ thông tin email");
      return;
    }
    if (password === "") {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }
    if (repassword === "") {
      toast.error("Vui lòng nhập xác nhận mật khẩu");
      return;
    }
    if (checkpassword === false) {
      toast.error("Mật khẩu không khớp, vui lòng nhập lại");
      return;
    }
    const values = {
      email: email.trim(),
      password: password.trim(),
    };
    try {
      const data = await registerService(values);
      if (data.data.message == 'Đăng ký thành công') {
        toast.success("Đăng ký thành công");
        navigate("/login");
      } else {
        toast.error("Đăng ký thất bại");
      }
    } catch (e) {
      const { response } = e as any;

      if (response.data.errors?.length > 0) {
        toast.error(response.data.errors[0]);
        return;
      }
      toast.error(response?.data?.message || "Đăng ký thất bại");
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
          />
        </div>
        <div className="w-full">
          <p>Mật khẩu</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={handlePasswordChange}
            value={password}

          />
        </div>
        <div className="w-full">
          <p>Nhập lại mật khẩu</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={handleRePasswordChange}
            value={repassword}

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
