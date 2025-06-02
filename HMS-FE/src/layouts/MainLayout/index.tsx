import Footer from "./Footer";
import Navbar from "./Navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container lg:mx-20">
      <Navbar />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;
