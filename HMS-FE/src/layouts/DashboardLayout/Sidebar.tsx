// components/Sidebar.tsx
import {
  LayoutDashboard,
  Hospital,
  User,
  FileUser,
  Users,
  Calendar,
  CalendarArrowDown,
} from "lucide-react";
import type { JSX } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-screen bg-white flex flex-col p-5 overflow-y-auto">
      <div className="flex items-center justify-center gap-2 mb-8 sticky top-0 bg-white">
        <div className="text-3xl text-indigo-500 font-bold">
          <Hospital className="w-8 h-8" />
        </div>
        <span className="text-xl font-semibold text-indigo-600">Hospital</span>
      </div>

      {SIDEBAR_ITEMS.map((sidebar) => (
        <div key={sidebar.id} className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
            {sidebar.label}
          </p>
          <div className="flex flex-col gap-1">
            {sidebar.items.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.href}
                onClick={() => navigate(item.href)}
              />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
  isActive = false,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) => (
  <div
    className={`flex items-center gap-2 px-4 py-3 text-gray-700 rounded-xl cursor-pointer transition ${
      isActive ? "bg-indigo-500 text-white" : "hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

export default Sidebar;

const SIDEBAR_ITEMS = [
  {
    id: 1,
    label: "Trang chủ",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
        href: "/dashboard",
      },
    ],
  },
  {
    id: 2,
    label: "Quản lý",
    items: [
      {
        id: "users",
        label: "Quản lý người dùng",
        icon: <Users className="w-4 h-4" />,
        href: "/users",
      },
      {
        id: "patients",
        label: "Quản lý bệnh nhân",
        icon: <FileUser className="w-4 h-4" />,
        href: "/patients",
      },
      {
        id: "doctors",
        label: "Quản lý bác sĩ",
        icon: <User className="w-4 h-4" />,
        href: "/doctors",
      },
    ],
  },
  {
    id: 3,
    label: "Phòng khám",
    items: [
      {
        id: "appointments",
        label: "Quản lý lịch hẹn",
        icon: <Calendar className="w-4 h-4" />,
        href: "/appointments",
      },
      {
        id: "rooms",
        label: "Quản lý phòng khám",
        icon: <Hospital className="w-4 h-4" />,
        href: "/rooms",
      },
      {
        id: "queues",
        label: "Hàng chờ phòng khám",
        icon: <CalendarArrowDown className="w-4 h-4" />,
        href: "/queues",
      },
    ],
  },
];
