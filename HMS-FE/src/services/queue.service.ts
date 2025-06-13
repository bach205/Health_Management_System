import mainRequest from "../api/mainRequest";
const BASE_URL = "api/v1/queues";

export const getQueueClinic = async (clinicId: string) => {
  const response = await mainRequest.get(`${BASE_URL}/${clinicId}`);
  return response.data;
};

export const getQueueStatus = async (clinicId: string) => {
  const response = await mainRequest.get(`${BASE_URL}/${clinicId}`);
  return response.data;
};

export const updateQueueStatus = async (queueId: string, status: string) => {
  const response = await mainRequest.patch(`${BASE_URL}/${queueId}/status`, {
    status,
  });
  return response.data;
};
