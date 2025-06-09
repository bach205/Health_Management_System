import { Bell, Menu, User } from "lucide-react";
import { IMAGE_CONST } from "../../constants/image.const";
import { Button, Tooltip } from "antd";
import {  useNavigate } from "react-router-dom";

const Topbar = ({ isCollapsed, setCollapsed }: { isCollapsed: boolean; setCollapsed: (isCollapsed: boolean) => void }) => {
  const navigate = useNavigate();
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
             Tên bác sĩ
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Topbar;
