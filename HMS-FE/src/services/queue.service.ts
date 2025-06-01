import mainRequest from "@/api/mainRequest";

export const getQueueClinic = async (clinicId: string) => {
  const response = await mainRequest.get(`/queues/${clinicId}`);
  return response.data;
};

export const updateQueueStatus = async (queueId: string, status: string) => {
  const response = await mainRequest.patch(`/queues/${queueId}/status`, {
    status,
  });
  return response.data;
};
