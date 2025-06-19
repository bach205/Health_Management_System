import { ProfileProvider } from "../../context/ProfileContext";
import Footer from "./Footer";
import Navbar from "./Navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container lg:mx-20">
      <ProfileProvider>
        <Navbar />
        <div className="flex-grow">{children}</div>
        <Footer />
      </ProfileProvider>
    </div>
  );
};

export default MainLayout;
