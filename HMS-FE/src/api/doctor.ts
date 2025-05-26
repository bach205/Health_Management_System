import type { IDoctor } from "../utils";
import instance from "./mainRequest";

const BASE_URL = "doctor";

export const createDoctor = (doctor: IDoctor) => {
    return instance.post(`${BASE_URL}/create`, doctor);
};

export const getDoctors = async (body: any) => {
    const data: { users: IDoctor[] } = {
        users: [
            {
                id: "000000000000000000000001",
                full_name: "bacsi1",
                email: "bacsi@gmail.com",
                phone: "9999999999",
                password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
                is_active: true,
                role: "doctor",
                date_of_birth: "2025-05-14T17:00:00.000Z",
                address: "aa",
                gender: "male",
                specialty: "Khám bệnh "
            },
            {
                id: "000000000000000000000002",
                full_name: "bacsi1",
                email: "bacsi@gmail.com",
                phone: "9999999999",
                password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
                is_active: true,
                role: "doctor",
                date_of_birth: "2025-05-14T17:00:00.000Z",
                address: "aa",
                gender: "male",
                specialty: "Khám bệnh "
            },

        ]
    };

    // return instance.post(`${BASE_URL}`, body);
    return data;
};

export const updateDoctor = (doctor: IDoctor) => {
    return instance.put(`${BASE_URL}/update/${doctor.id}`, doctor);
};

export const getDoctorById = (id: string) => {
    return instance.get(`${BASE_URL}/${id}`);
};