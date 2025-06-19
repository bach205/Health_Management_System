import type { IUserBase } from "../types/index.type.ts";
import instance from "../api/mainRequest.ts";
import axios from "axios";
import { API_URL } from "../config/constants";

const BASE_URL = "api/v1/nurse";

export const createNurse = async (nurse: IUserBase) => {
  return await instance.post(`${BASE_URL}/create`, nurse);
};

export const getAllNurse = async (params?: { keyword?: string; sort?: string }) => {
  return await instance.get(`${BASE_URL}/`, { params });
}

export const updateNurse = async (id: number, nurse: IUserBase) => {
  console.log(nurse)
  return await instance.put(`${BASE_URL}/update/${id}`, nurse);
};

export const getNurseById = async (id: string) => {
  return await instance.get(`${BASE_URL}/${id}`);
};

export const banNurse = async (id: string) => {
  return await instance.put(`${BASE_URL}/ban/${id}`);
};

export const resetPassword = async (id: string) => {
  return await instance.put(`${BASE_URL}/reset-password/${id}`);
};

export const nurseRescheduleAppointmentService = async (data: any) => {
  try {
    const response = await axios.post(
      `${API_URL}/appointments/nurse/reschedule`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
}
export const deleteNurse = async (id: string) => {
  return await instance.delete(`${BASE_URL}/delete/${id}`);
};

