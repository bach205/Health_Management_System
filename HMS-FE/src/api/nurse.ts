import type { IUserBase } from "../types/index.type.ts";
import mainRequest from "./mainRequest.ts";

const BASE_URL = "api/v1/nurse";

export const createNurse = async (nurse: IUserBase) => {
    return await mainRequest.post(`${BASE_URL}/create`, nurse);
};

export const getAllNurse = async (params?: {
    keyword?: string;
    sort?: string;
    shift?: string;
}) => {
    return await mainRequest.get(`${BASE_URL}/get-all-nurse`, { params });
}

export const updateNurse = async (id: number, nurse: IUserBase) => {
    console.log(nurse)
    return await mainRequest.put(`${BASE_URL}/update/${id}`, nurse);
};

export const getNurseById = async (id: number) => {
    return await mainRequest.get(`${BASE_URL}/${id}`);
};

export const banNurse = async (id: number) => {
    return await mainRequest.put(`${BASE_URL}/ban/${id}`);
};

export const resetPassword = async (id: string) => {
    return await mainRequest.put(`${BASE_URL}/reset-password/${id}`);
};

export const deleteNurse = async (id: string) => {
    return await mainRequest.delete(`${BASE_URL}/delete/${id}`);
};
