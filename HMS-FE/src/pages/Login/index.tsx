import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google"
import { GoogleOAuthProvider } from '@react-oauth/google'
import data from "../../assets/googleClientID/ClientIDGoolge.json" with {type: "json"}
const Login = () => {
  const client = data.web.client_id;
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
  const handleWindowOpenLocation = (sub_link:string) => {
    window.location.href=`http://localhost:5173/${sub_link}`;
  };
  const onSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      email: email.trim(),
      password: password.trim(),
    };
    const data = await auth.handleLogin(values);
    if (data === "patient") handleWindowOpenLocation("");
    if (data === "nurse") handleWindowOpenLocation("sale-medicine");
    if (data === "doctor") handleWindowOpenLocation("doctor/queue");
    if (data === "admin") handleWindowOpenLocation("admin");

  };

  const onGoogleSubmitHandler = async (data: object) => {
    const datax = await auth.handleGoogleLogin(data);

    if (datax === "patient") navigate("/");
    if (datax === "admin") navigate("/admin");
  };

  return (
    <GoogleOAuthProvider clientId={client}>
      <form className="min-h-[80vh] flex items-center" >
        <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
          <p className="text-2xl font-semibold">Đăng Nhập</p>
          <p>Xin mời đăng nhập </p>
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
            onClick={onSubmitHandler}
          >
            Đăng Nhập
          </button>
          <div>
            <GoogleLogin onSuccess={credentialResponse => {
              // console.log(credentialResponse);
              const data = {
                token: credentialResponse.credential
              }
              console.log(data);
              onGoogleSubmitHandler(data);
            }}
              onError={() => {
                console.log('Login Failed');
              }}
              width="100%"
              useOneTap
            />

          </div>
          <p>
            Chưa có tài khoản?{" "}
            <span className="text-primary cursor-pointer hover:underline">
              <Link to="/register" className="text-primary hover:underline ms-1">
                Đăng Ký
              </Link>
            </span>
            <Link to="/forget-password" className="ms-12">Quên mật khẩu</Link>
          </p>

        </div>
      </form>
    </GoogleOAuthProvider>
  );
};

export default Login;
