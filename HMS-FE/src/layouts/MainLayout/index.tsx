import Header from "@/layouts/MainLayout/Header";
import Footer from "@/layouts/MainLayout/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;
