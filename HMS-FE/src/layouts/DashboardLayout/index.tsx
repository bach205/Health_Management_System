import Sidebar from "@/layouts/DashboardLayout/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      {children}
    </div>
  );
};

export default DashboardLayout;
