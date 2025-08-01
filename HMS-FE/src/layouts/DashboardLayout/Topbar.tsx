import { Button, Flex, Tooltip } from "antd";
import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import Notification from "../MainLayout/Notification";
const Topbar = ({ isCollapsed, setCollapsed }: { isCollapsed: boolean; setCollapsed: (isCollapsed: boolean) => void }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const auth = useAuth();
  // console.log(user)
  return (
    <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-20">
      <div className="flex gap-5">
        <button onClick={() => setCollapsed(!isCollapsed)} className="text-2xl cursor-pointer hover:bg-gray-200 rounded-full p-1">
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Flex>
          <Tooltip title="Thông Báo" placement="bottom">
            <Notification />
          </Tooltip>

          <Tooltip title="Sửa thông tin" placement="bottom">
            <Button type="text"
              onClick={() => user?.role === "doctor" ? navigate("/doctor-profile") : navigate("/staff-profile")}
              icon={<User className="w-4 h-4 text-2xl" />}
            >
              {user?.role === "admin" && "Quản trị viên"}
              {user?.role === "doctor" && "Bác sĩ"}
              {user?.role === "nurse" && "Y tá"}

            </Button>
          </Tooltip>

          <Tooltip title="Đăng xuất" placement="bottom">
            <Button type="text" onClick={() => auth.handleLogout()} >
              Đăng xuất
            </Button>

          </Tooltip>
        </Flex>
      </div>
    </div>
  );
};

export default Topbar;
