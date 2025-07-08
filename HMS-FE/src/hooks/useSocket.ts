// hooks/useSocket.ts
import { useEffect } from "react";
import { getSocket } from "../services/socket";
const socket = getSocket();

export const useSocket = (
  roomId: string,
  eventName: string,
  handler: (data: any) => void
) => {
  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", roomId);
    socket.on(eventName, handler);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off(eventName, handler);
    };
  }, [roomId, eventName, handler]);

  return socket;
};
