
// import { message } from "antd";
import instance from "../api/mainRequest";
import type { IPatient } from "../types/index.type";
const BASE_URL = "api/v1/patients";
const baseURL = `/api/v1/auth`;
const examinationOrderURL = `/api/v1/examination-order`;
const patientURL = `/api/v1/patient`;
const staffURL = `/api/v1/doctor`;
interface IUpdatePatient {
  userId: number;
  updateData: any;
}
export const updateProfile = ({ userId, updateData }: IUpdatePatient) => {
  return instance.put(`${baseURL}/update-patient`, { userId, updateData });
};

export const getPatientById = (id: number) => {
  return instance.get(`${BASE_URL}/${id}`);
};
export const getProfile = async () => {
  const response = await instance.get(`${baseURL}/me`);
  return response;
};

export const updatePassword = async (updateData : any) => {
  const response = await instance.post(`${baseURL}/reset-password`, { ...updateData });
  return response;
};

export const updatePatientPassword = async (id: number) => {
  const response = await instance.post(`${patientURL}/update-password`, { id });
  return response;
};

export const fetchUserImage = async (id: number) => {
  const response = await instance.get(`${BASE_URL}/${id}/avatar`)
  return response;
}
export const getPatientExaminationOrder = async (id: number) => {
  const response = await instance.get(`${examinationOrderURL}/patient/${id}`)
  return response;
}

export const getPatients = async (searchOptions: any) => {
  return instance.post(`${patientURL}`, searchOptions);
};
export const createPatient = (patient: IPatient) => {
    return instance.post(`${patientURL}/create`, patient);
};

export const getDoctors = async (searchOptions: any) => {
    return instance.post(`${patientURL}`, searchOptions);
};

export const updatePatient = (id: number, updateData: IPatient) => {
    return instance.post(`${patientURL}/update`, { userId: id, updateData });
};

export const getDoctorById = (id: number) => {
    return instance.get(`${patientURL}/${id}`);
};

export const updateStatus = (id: number, status: boolean) => {
    return instance.post(`${patientURL}/update-status/`, { id, isActive: status });
};

export const updateStaffInfo = (data: any) => {
    return instance.post(`${staffURL}/update-staff-info`, data);
};

export const updateAvatar = (data: any) => {
    return instance.post(`${baseURL}/update-avatar`, data);
};

