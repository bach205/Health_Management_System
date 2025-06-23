import type { IDoctor } from "../types/index.type";
import instance from "../api/mainRequest";
const BASE_URL = "api/v1/doctor";

export const createDoctor = (doctor: IDoctor) => {
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

export const updatePassword = (id: number) => {
    return instance.post(`${BASE_URL}/update-password/`, { id });
};

export const getDoctorsInClinic = (clinicId: number) => {
    return instance.get(`${BASE_URL}/clinic/${clinicId}`);
};

export const getDoctorAvailableSlotsByDoctorId = (doctorId: number) => {
    return instance.get(`${BASE_URL}/available-slots/${doctorId}`);
};
export const getDoctorAvailableSlotsByDate = (doctorId: number, date: string, clinicId: number) => {
    return instance.get(`api/v1/appointment/slots?doctor_id=${doctorId}&slot_date=${date}&clinic_id=${clinicId}`);
};



export const updateDoctorProfile = (doctor: any) => {
    return instance.post(`${BASE_URL}/update-info`, doctor);
};