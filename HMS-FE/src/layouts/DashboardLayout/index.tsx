import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useLocation } from "react-router-dom";

// this 
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // get route url
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen w-full">
      <Sidebar role={user?.role || ""} isCollapsed={isCollapsed} />
      <div className="flex-1 overflow-y-auto">
        <Topbar isCollapsed={isCollapsed} setCollapsed={setIsCollapsed} />
        
        <div className={`px-12 rounded-t-3xl shadow-md bg-[#F4F7FB] min-h-full ${(pathname === "/doctor/queue" || pathname === "/admin/dashboard") && "pt-5"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
