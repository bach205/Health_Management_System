// hooks/useSocket.ts
import { useEffect } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const socket = io(BACKEND_URL, {
  withCredentials: true,
});

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
