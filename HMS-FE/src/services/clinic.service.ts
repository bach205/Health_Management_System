import  mainRequest from "../api/mainRequest";

const baseURL = `http://localhost:8080/api/v1/clinic`;

export const getClinicService = async () => {
  const response = await mainRequest.get(`${baseURL}/`);

  return response;
};

export const createClinicService = async (body : object) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.post(`${baseURL}/create`, data);

  return response;
};

export const updateClinicService = async (body : object, id : string | undefined) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.put(`${baseURL}/update/${id}`, data);

  return response;
};

export const deteleClinicService = async (id : string | undefined) => {  
  const response = await mainRequest.delete(`${baseURL}/delete/${id}`);

  return response;
};

// export const deteleClinicService = async (body : object) => {
//   const data = JSON.stringify(body);
//   const response = await mainRequest.post(`${baseURL}/login`, data);
 
//   return response;
// };
