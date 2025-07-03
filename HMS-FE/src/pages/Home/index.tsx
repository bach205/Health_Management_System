import Banner from "../../layouts/MainLayout/Banner";
import ChatUI from "../../layouts/MainLayout/ChatUI";
import Header from "../../layouts/MainLayout/Header";
import SpecialityMenu from "../../layouts/MainLayout/SpecialityMenu";


const Home = () => {
  return (
    <div className="container flex flex-col justify-self-center">
      <Header />
      <SpecialityMenu />
      <ChatUI />
      <Banner />
    </div>
  );
};

export default Home;
