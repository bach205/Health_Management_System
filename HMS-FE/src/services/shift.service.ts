import  mainRequest from "../api/mainRequest";

const baseURL = `http://localhost:8080/api/v1/shifts`;

export const getShiftService = async () => {
  const response = await mainRequest.get(`${baseURL}/`);
  return response;
};

export const createShiftService = async (body : object) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.post(`${baseURL}`, data);

  return response;
};

export const updateShiftService = async (body : object, id : string | undefined) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.put(`${baseURL}/${id}`, data);

  return response;
};

export const deteleShiftService = async (id : string | undefined) => {  
  const response = await mainRequest.delete(`${baseURL}/${id}`);

  return response;
};


