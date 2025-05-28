// hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  withCredentials: true,
}); // thay bằng URL backend

export const useSocket = (
  roomId: string,
  onNewPatient: (data: any) => void
) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      socket.emit("joinRoom", roomId);
      socket.on("new-patient", onNewPatient);
      initialized.current = true;
    }

    return () => {
      socket.off("new-patient", onNewPatient);
    };
  }, [roomId, onNewPatient]);

  return socket;
};
