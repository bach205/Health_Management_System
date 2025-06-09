
import instance from "../api/mainRequest";
const BASE_URL = "api/v1/patients";
const baseURL = `/api/v1/auth`;
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

export const updatePassword = async (data: any) => {
  const response = await instance.post(`${baseURL}/reset-password`, data);
  return response;
};
