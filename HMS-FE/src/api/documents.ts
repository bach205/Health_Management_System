import axios from "./mainRequest";

const BASE_URL = "api/v1/documents";
export const getAllDocuments = () => axios.get(`${BASE_URL}`);
export const uploadDocument = (formData: FormData) => axios.post(`${BASE_URL}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const deleteDocument = (id: string) => axios.delete(`${BASE_URL}/${id}`);
export const downloadDocument = (id: string) => axios.get(`${BASE_URL}/${id}`, { responseType: "blob" }); 