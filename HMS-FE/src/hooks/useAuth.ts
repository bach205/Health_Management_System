
import { loginService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";

interface userdata {
  email : String,
  password : String
}

const useAuth = () => {
  const { login, logout } = useAuthStore();
  
  const handleLogin = async (user : userdata) => {
    let status = null;
    try {
      const response = await loginService(user);
      if (response.status === 200) {
        login(response.data.metadata.user, response.data.metadata.accessToken);      
        toast.success("Đăng nhập thành công");
        return response.data.metadata.user.role;
      } else {
        toast.error("Đăng nhập thất bại");
      }
    } catch (error: any) {
      toast.error("Đăng nhập thất bại");
    }
   
  };

  const handleLogout = () => {
    logout();
  };

  return { handleLogin, handleLogout };
};

export default useAuth;
