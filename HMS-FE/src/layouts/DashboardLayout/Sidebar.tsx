import {
  LayoutDashboard,
  Hospital,
  User,
  FileUser,
  Users,
  Calendar,
  CalendarArrowDown,
  ClipboardType,
} from "lucide-react";
import type { JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ isCollapsed, role }: { isCollapsed: boolean, role: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"
        } h-screen bg-white flex flex-col p-5 overflow-y-auto transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-8 top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <Hospital className="w-8 h-8 text-indigo-500" />
          {!isCollapsed && (
            <span className="text-xl font-semibold text-indigo-600">
              Hospital
            </span>
          )}
        </div>
      </div>

      {SIDEBAR_ITEMS.map((sidebar) => {
        // if (sidebar.label === "Quản lý" && role !== "admin") {
        //     return null
        // }

        // if (sidebar.label === "Bác sĩ" && role !== "doctor") {
        //   return <></>
        // }

        return (
          <div key={sidebar.id} className="mb-4">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                {sidebar.label}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {sidebar.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={location.pathname === item.href}
                  onClick={() => navigate(item.href)}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        )
      })}
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
  isActive = false,
  onClick,
  isCollapsed,
}: {
  icon: JSX.Element;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}) => (
  <div
    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} px-4 py-3 text-gray-700 rounded-xl cursor-pointer transition ${isActive ? "bg-indigo-500 text-white" : "hover:bg-gray-100"}`}
    onClick={onClick}
  >
    <div>
      {icon}

    </div>
    {!isCollapsed && <span className="text-sm">{label}</span>}
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
        href: "/admin/users",
      },
      {
        id: "workschedule",
        label: "Lịch làm việc",
        icon: <Calendar className="w-4 h-4" />,
        href: "/workschedule",
      },
      {
        id: "shift",
        label: "Quản lý ca làm việc",
        icon: <Calendar className="w-4 h-4" />,
        href: "/shift",
      },
      {
        id: "patients",
        label: "Quản lý bệnh nhân",
        icon: <FileUser className="w-4 h-4" />,
        href: "/admin/patients",
      },
      {
        id: "doctors",
        label: "Quản lý bác sĩ",
        icon: <User size={20} className="w-4 h-4" />,
        href: "/admin/doctors",
      },
      {
        id: "nurses",
        label: "Quản lý y tá",
        icon: <User className="w-4 h-4" />,
        href: "/admin/nurses",
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
  {
    id: 4,
    label: "Bác sĩ",
    items: [
      {
        id: "examination",
        label: "Khám bệnh",
        icon: <ClipboardType className="w-4 h-4" />,
        href: "/examination",
      },
    ],
  },
  {
    id: 5,
    label: "Y Tá",
    items: [
      {
        id: "nurse-book-appointments",
        label: "Đặt Lịch Hẹn",
        icon: <ClipboardType className="w-4 h-4" />,
        href: "/nurse-book-appointments",
      },
      {
        id: "nurse-manage-appointments",
        label: "Quản lý lịch hẹn",
        icon: <ClipboardType className="w-4 h-4" />,
        href: "/user-book-appointments",
      },
    ],
  },
];
