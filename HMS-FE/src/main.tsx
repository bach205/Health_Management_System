import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Bounce, ToastContainer } from "react-toastify";
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider theme={{
      components: {
        Button: {
          colorPrimary: "#5f6fff",
          colorPrimaryText: "#fff",
          colorPrimaryTextHover: "#fff",
          colorPrimaryTextActive: "#fff",
          colorPrimaryHover: "#5f8aff",
          colorPrimaryActive: "#5f8aff",
        },
      },
    }}>
      <App />
    </ConfigProvider>
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  </StrictMode>
);
