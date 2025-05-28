import type { IUserBase } from "../types/index.type";
import instance from "../api/mainRequest";

const BASE_URL = "nurse";

export const createNurse = (nurse: IUserBase) => {
    return instance.post(`${BASE_URL}/create`, nurse);
};

export const getNurses = async (body: any) => {
    const data: { users: IUserBase[] } = {
        users: [
            {
                id: "000000000000000000000001",
                full_name: "Nguyễn văn A",
                email: "yta1@gmail.com",
                phone: "9999999999",
                password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
                is_active: true,
                role: "doctor",
                date_of_birth: "1990-05-14T17:00:00.000Z",
                address: "Hà Nội",
                gender: "male",
            },
            {
                id: "000000000000000000000002",
                full_name: "Nguyễn văn B",
                email: "yta2@gmail.com",
                phone: "9999999999",
                password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
                is_active: true,
                role: "doctor",
                date_of_birth: "1990-05-14T17:00:00.000Z",
                address: "TP Hồ Chí Minh",
                gender: "male",
            },

        ]
    };

    // return instance.post(`${BASE_URL}`, body);
    return data;
};

export const updateNurse = (nurse: IUserBase) => {
    return instance.put(`${BASE_URL}/update/${nurse.id}`, nurse);
};

export const getNurseById = (id: string) => {
    return instance.get(`${BASE_URL}/${id}`);
};