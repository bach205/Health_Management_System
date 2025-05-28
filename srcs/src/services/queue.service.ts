import mainRequest from "@/api/mainRequest";

export const getQueueRoom = async () => {
  const response = await mainRequest.get("/queue-room");
  return response.data;
};
