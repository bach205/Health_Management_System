import instance from "../api/mainRequest";
const BASE_URL = "api/v1/patient";

export const updateProfile = (patient: any) => {
    return instance.post(`${BASE_URL}/update-profile`, patient);
};

export const getPatientById = (id: number) => {
    return instance.get(`${BASE_URL}/${id}`);
};