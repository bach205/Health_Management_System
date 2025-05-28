import { IMAGE_CONST } from "@/constants/image.const";
import { Bell, Menu } from "lucide-react";

const Topbar = ({ isCollapsed, setCollapsed }: { isCollapsed: boolean; setCollapsed: (isCollapsed: boolean) => void }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-20">
      <div className="ml-5 flex gap-5">
        <button onClick={() => setCollapsed(!isCollapsed)}>
          <Menu className="w-5 h-5" />
        </button>
        <Bell
          className="w-5 h-5"
          style={{
            color: "var(--color-gray-500)",
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden p-1">
          <img
            src={IMAGE_CONST.AVATAR_DEFAULT}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
