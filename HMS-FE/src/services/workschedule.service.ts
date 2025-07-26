import mainRequest from "../api/mainRequest";

const baseURL = `/api/v1/`;

export const getDoctorService = async () => {
  const response = await mainRequest.get(`${baseURL}doctor`);

  return response;
};

export const getWorkSchedulesService = async () => {

  const response = await mainRequest.get(`${baseURL}work-schedules`);

  return response;
};

export const createWorkScheduleService = async (body: object) => {
  const data = JSON.stringify(body);
  const response = await mainRequest.post(`${baseURL}work-schedules`, data);

  return response;
};

export const updateWorkScheduleService = async (body: object, id: string | undefined) => {
  const data = JSON.stringify(body);
  const response = await mainRequest.put(`${baseURL}work-schedules/${id}`, data);

  return response;
};

export const deleteWorkScheduleService = async (id: string | undefined) => {
  const response = await mainRequest.delete(`${baseURL}work-schedules/${id}`);

  return response;
};


