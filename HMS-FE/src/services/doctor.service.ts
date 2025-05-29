import type { IDoctor } from "../types/index.type";
import instance from "../api/mainRequest";
import { PASSWORD_DEFAULT } from "../constants/user.const";
const BASE_URL = "api/v1/doctors";

export const createDoctor = (doctor: IDoctor) => {
    if (!doctor.password) {
        doctor.password = PASSWORD_DEFAULT;
    }
    console.log(doctor)
    return instance.post(`${BASE_URL}/create`, doctor);
};

export const getDoctors = async (searchOptions: any) => {
    return instance.post(`${BASE_URL}`, searchOptions);
};

export const updateDoctor = (doctor: IDoctor) => {
    return instance.post(`${BASE_URL}/update`, doctor);
};

export const getDoctorById = (id: number) => {
    return instance.get(`${BASE_URL}/${id}`);
};

export const updateStatus = (id: number, status: boolean) => {
    return instance.post(`${BASE_URL}/update-status/`, { id, isActive: status });
};

export const updatePassword = (id: number, password: string) => {
    return instance.post(`${BASE_URL}/update-password/`, { id, password });
};