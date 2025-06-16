import { Bell, Menu, User } from "lucide-react";
import { IMAGE_CONST } from "../../constants/image.const";
import { Button, Tooltip } from "antd";
import {  useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Topbar = ({ isCollapsed, setCollapsed }: { isCollapsed: boolean; setCollapsed: (isCollapsed: boolean) => void }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  console.log(user)
  return (
    <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-20">
      <div className="flex gap-5">
        <button onClick={() => setCollapsed(!isCollapsed)} className="text-2xl cursor-pointer hover:bg-gray-200 rounded-full p-1">
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip title="Sửa thông tin" placement="bottom">
          <Button type="text"
            onClick={() => navigate("/doctor-profile")}
            icon={<User className="w-4 h-4 text-2xl" />}
          >
            {user?.role === "admin" && "Quản trị viên"} 
            {user?.role === "doctor" && "Bác sĩ"} 
            {user?.role === "nurse" && "Y tá"} 
            
             {user?.full_name ? user?.full_name : "Không có tên"}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Topbar;
