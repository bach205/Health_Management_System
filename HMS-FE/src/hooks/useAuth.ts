import { loginService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";

const useAuth = () => {
  const { login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await loginService(email, password);

      if (response.status === 200) {
        login(response.data.user, response.data.token);
        toast.success("Đăng nhập thành công");
      } else {
        toast.error(response.data.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      toast.error(error.response.data.message || "Đã có lỗi xảy ra");
    }
  };

  const handleLogout = () => {
    logout();
  };

  return { handleLogin, handleLogout };
};

export default useAuth;
