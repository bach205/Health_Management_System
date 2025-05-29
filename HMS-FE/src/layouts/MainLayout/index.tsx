import Footer from "./Footer.tsx";
import Navbar from "./Navbar.tsx";



const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container">
      <Navbar />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
};

export default MainLayout;
