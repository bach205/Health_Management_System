import type { IDoctor } from "../types/index.type";
import instance from "../api/mainRequest";
import { PASSWORD_DEFAULT } from "../constants/user.const";
const BASE_URL = "doctor";

export const createDoctor = (doctor: IDoctor) => {
    if (!doctor.password) {
        doctor.password = PASSWORD_DEFAULT;
    }
    return instance.post(`${BASE_URL}/create`, doctor);
};

export const getDoctors = async (body: any) => {
    // const data: { users: IDoctor[] } = {
    //     users: [
    //         {
    //             id: "000000000000000000000001",
    //             full_name: "Nguyễn văn A",
    //             email: "bacsi1@gmail.com",
    //             phone: "9999999999",
    //             password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
    //             is_active: true,
    //             role: "doctor",
    //             date_of_birth: "1990-05-14T17:00:00.000Z",
    //             address: "Hà Nội",
    //             bio: '10 năm kinh nghiệm',
    //             gender: "male",
    //             specialty: "Nội khoa"
    //         },
    //         {
    //             id: "000000000000000000000002",
    //             full_name: "Nguyễn văn B",
    //             email: "bacsi2@gmail.com",
    //             phone: "9999999999",
    //             password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
    //             is_active: true,
    //             role: "doctor",
    //             date_of_birth: "1990-05-14T17:00:00.000Z",
    //             address: "TP Hồ Chí Minh",
    //             bio: '10 năm kinh nghiệm',
    //             gender: "male",
    //             specialty: "Ngoại khoa"
    //         },

    //     ]
    // };

    return instance.post(`${BASE_URL}`, body);
    // return data;
};

export const updateDoctor = (doctor: IDoctor) => {
    return instance.put(`${BASE_URL}/update/${doctor.id}`, doctor);
};

export const getDoctorById = (id: string) => {
    return instance.get(`${BASE_URL}/${id}`);
};