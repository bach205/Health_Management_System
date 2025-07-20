import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

let socket: Socket | null = null;
let hasJoinedRoom = false;

export const getSocket = (userId: string) => {
    if (!socket) {
        socket = io(SOCKET_URL, { // kết nối đến server socket
            withCredentials: true,
            transports: ["websocket"],
            auth: {
                token: localStorage.getItem("token"),
            },
        });

        socket.on("connect", () => {
            if (!hasJoinedRoom) {
                socket?.emit("join", { userId });
                hasJoinedRoom = true;
            }
        });
    }

    return socket;
};
