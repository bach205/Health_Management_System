import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex h-screen w-full">
      <Sidebar role={user?.role || ""} isCollapsed={isCollapsed} />
      <div className="flex-1 overflow-y-auto">
        <Topbar isCollapsed={isCollapsed} setCollapsed={setIsCollapsed} />
        <div className="px-12 pt-10 rounded-t-3xl shadow-md bg-[#F4F7FB] min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
