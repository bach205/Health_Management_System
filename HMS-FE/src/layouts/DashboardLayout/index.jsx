import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen w-full">
            <Sidebar />
            {children}
        </div>
    );
};

export default DashboardLayout; 