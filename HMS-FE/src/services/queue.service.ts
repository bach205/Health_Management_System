import mainRequest from "../api/mainRequest";
const BASE_URL = "api/v1/queue";

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export const getQueueClinic = async (clinicId: string, params?: PaginationParams, type?: string) => {
  const query = new URLSearchParams();

  if (params?.pageNumber) query.append("pageNumber", String(params.pageNumber));
  if (params?.pageSize) query.append("pageSize", String(params.pageSize));
  if (type) query.append("type", type);

  const response = await mainRequest.get(
    `${BASE_URL}/clinic/${clinicId}?${query.toString()}`
  );
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

export const getAllQueueNumber = async (clinic_id: number) => {
  const response = await mainRequest.get(`${BASE_URL}/get_queue_number?clinic_id=${clinic_id}`);
  return response.data;
}
