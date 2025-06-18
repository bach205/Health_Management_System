import mainRequest from "../api/mainRequest";
const BASE_URL = "api/v1/queue";

export const getQueueClinic = async (clinicId: string) => {
  const response = await mainRequest.get(`${BASE_URL}/clinic/${clinicId}`);
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

export const assignAdditionalClinic = async (data: {
  patient_id: number;
  to_clinic_id: number;
  record_id: number;
  priority?: number;
}) => {
  const response = await mainRequest.post("/queues/queue-clinic/assign", data);
  return response.data;
};
