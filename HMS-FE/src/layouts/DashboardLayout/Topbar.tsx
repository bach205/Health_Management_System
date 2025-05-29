import { IMAGE_CONST } from "@/constants/image.const";
import { Bell } from "lucide-react";

const Topbar = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white sticky top-0">
      <div className="ml-5">
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
