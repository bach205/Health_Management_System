import { io, Socket } from "socket.io-client";
// import { useAuthStore } from '../store/authStore';
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

let socket: Socket | null = null;

export const getSocket = (userId: string) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ["websocket"],
            auth: {
                token: localStorage.getItem("token")
            }
        });
    }
    socket.emit('join', { userId });
    return socket;
}; 