import  mainRequest from "../api/mainRequest";

const baseURL = `/api/v1/work-schedules`;

export const getDoctorService = async () => {
  const response = await mainRequest.get(`http://localhost:8080/api/v1/doctor`);

  return response;
};

export const getWorkSchedulesService = async () => {
  
  const response = await mainRequest.get(`http://localhost:8080/api/v1/work-schedules`);
  
  return response;
};

export const createWorkScheduleService = async (body : object) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.post(`${baseURL}`, data);

  return response;
};

export const updateWorkScheduleService = async (body : object, id : string | undefined) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.put(`${baseURL}/${id}`, data);

  return response;
};

export const deleteWorkScheduleService = async (id : string | undefined) => {  
  const response = await mainRequest.delete(`${baseURL}/${id}`);

  return response;
};


