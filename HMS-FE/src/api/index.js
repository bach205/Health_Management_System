import { notification } from "antd";
import axios from "axios";
import { baseURL } from "src/utils";

// Tạo api axios với cấu hình mặc định
export const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Thời gian chờ tối đa 10 giây
});

// Interceptor xử lý phản hồi
api.interceptors.response.use(
    (response) => {
      // Trả về dữ liệu từ response.data.data nếu có
      return response.data.data || response.data;
    },
    (error) => {
      // Xử lý lỗi từ server
      if (error.response) {
        notification.error({
          message: error.response.data.message || "An error occurred",
        });
        return Promise.reject(error.response.data);
      }
      // Xử lý lỗi mạng
      notification.error({
        message: "Network error",
      });
      return Promise.reject({ message: "Network error" });
    }
);