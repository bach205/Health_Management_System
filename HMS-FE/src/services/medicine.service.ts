import type { IMedicine } from "../types/index.type";
import instance from "../api/mainRequest";

const BASE_URL = "api/v1/medicine";

// Tạo thuốc mới
export const createMedicine = (medicine: IMedicine) => {
  return instance.post(`${BASE_URL}/create`, medicine);
};

// Lấy danh sách thuốc có tìm kiếm + lọc + phân trang
export const getMedicines = (searchOptions: any) => {
  return instance.post(`${BASE_URL}`, searchOptions);
};

// Cập nhật thuốc
export const updateMedicine = (medicine: IMedicine) => {
  return instance.post(`${BASE_URL}/update/${medicine.id}`, medicine);
};

// Lấy thuốc theo ID
export const getMedicineById = (id: number) => {
  return instance.get(`${BASE_URL}/${id}`);
};

// Xoá thuốc theo ID
export const deleteMedicine = (id: number) => {
  return instance.delete(`${BASE_URL}/delete/${id}`);
};
