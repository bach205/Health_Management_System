<<<<<<< HEAD
import mainRequest from "../api/mainRequest";
=======
import mainRequest from "@/api/mainRequest";
>>>>>>> master

export const getQueueRoom = async () => {
  const response = await mainRequest.get("/queue-room");
  return response.data;
};
