import mainRequest from "../api/mainRequest";

const BASE_URL = "api/v1/clinic";

export const getClinicService = async () => {
  const response = await mainRequest.get(`${BASE_URL}`);

  return response;
};

export const createClinicService = async (body: object) => {
  const data = JSON.stringify(body);
  const response = await mainRequest.post(`${BASE_URL}/create`, data);

  return response;
};

export const getClinics = async () => {
  const response = await mainRequest.get(`${BASE_URL}/`);

  return response;
};


export const updateClinicService = async (
  body: object,
  id: string | undefined
) => {
  const data = JSON.stringify(body);
  const response = await mainRequest.put(`${BASE_URL}/update/${id}`, data);

  return response;
};

export const deteleClinicService = async (id: string | undefined) => {
  const response = await mainRequest.delete(`${BASE_URL}/delete/${id}`);

  return response;
};

// export const deteleClinicService = async (body : object) => {
//   const data = JSON.stringify(body);
//   const response = await mainRequest.post(`${baseURL}/login`, data);

//   return response;
// };

//đây là cái mà lấy danh sách phòng khám cho hàng chờ - t để bên kia là getAllClinicsForDoctor
// export const getClinics = async () => {
//   const response = await mainRequest.get("/clinics");
//   return response.data;
// };
