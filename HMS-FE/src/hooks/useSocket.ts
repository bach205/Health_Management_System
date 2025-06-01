// hooks/useSocket.ts
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
}); // thay bằng URL backend

export const useSocket = (
  roomId: string,
  eventName: string,
  handler: (data: any) => void
) => {
  useEffect(() => {
    socket.emit("joinRoom", roomId);
    socket.on(eventName, handler);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off(eventName, handler);
    };
  }, [roomId, eventName, handler]);

  return socket;
};
