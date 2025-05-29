import Sidebar from "@/layouts/DashboardLayout/Sidebar";
import Topbar from "@/layouts/DashboardLayout/Topbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="px-24 pt-10 rounded-t-3xl shadow-md bg-[#F4F7FB]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
