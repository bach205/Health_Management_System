import type { IUserBase } from "../types/index.type.ts";
import instance from "./instance.ts";

const BASE_URL = "/nurse";

export const createNurse = async (nurse: IUserBase) => {
    return await instance.post(`${BASE_URL}/create`, nurse);
};

export const getAllNurse = async (params?: { keyword?: string; sort?: string }) => {
    return await instance.get(`${BASE_URL}/get-all-nurse`, { params });
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

