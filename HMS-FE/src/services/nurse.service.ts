import type { IUserBase } from "../types/index.type";
import instance from "../api/mainRequest";
import { PASSWORD_DEFAULT } from "../constants/user.const";

const BASE_URL = "api/v1/nurses";

export const createNurse = (nurse: IUserBase) => {
    if (!nurse.password) {
        nurse.password = PASSWORD_DEFAULT;
    }
    return instance.post(`${BASE_URL}/create`, nurse);
};

export const getNurses = async (body: any) => {
    return instance.post(`${BASE_URL}`, body);
};

export const updateNurse = (nurse: IUserBase) => {
    return instance.put(`${BASE_URL}/update/${nurse.id}`, nurse);
};

export const getNurseById = (id: string) => {
    return instance.get(`${BASE_URL}/${id}`);
};