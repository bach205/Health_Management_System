import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

import { useState } from "react";
const Login = () => {
    let navigate = useNavigate();
    let auth = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleEmailChange = (e: any) => {
      setEmail(e.target.value);
    };

    const handlePasswordChange = (e: any) => {
      setPassword(e.target.value);
    };

    const onSubmitHandler = async (e: React.FormEvent) => {
      e.preventDefault();
      const values = {
        email: email.trim(),
        password: password.trim(),
      };
      const data = await auth.handleLogin(values);
      console.log(data);
      if(data === "patient") navigate("/");
      if(data === "admin") navigate("/admin");
    };

     
      return (
        <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
          <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
            <p className="text-2xl font-semibold">
              Đăng Nhập
            </p>
            <p>
              Xin mời đăng nhập để đặt lịch hẹn
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
              <p>Password</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={handlePasswordChange}
                value={password}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#5f6fff] hover:bg-[#5f6fffd5] text-white w-full py-2 rounded-md text-base"
            >
              Đăng Nhập
            </button>
            <p>
              Chưa có tài khoản?{" "}
            <span className="text-primary cursor-pointer hover:underline">
              <Link to="/register" className="text-primary hover:underline">Đăng Ký</Link>         
            </span>
            </p>
          </div>
        </form>
      );
};

export default Login;
