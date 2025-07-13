// hooks/useSocket.ts
import { useEffect } from "react";
import { getSocket } from "../../services/socket";
import { useAuthStore } from "../../store/authStore";
import { socket } from "../../utils/socket";

export const useSocket = (
  roomId: string,
  eventName: string,
  handler: (data: any) => void
) => {
  const { user } = useAuthStore()

  useEffect(() => {
    const socket = getSocket(user?.id || 'defaultUserId');
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
