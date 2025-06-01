const socketIO = require("socket.io");

let ioInstance = null;
function initSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  ioInstance = io;

  //   io.use(async (socket, next) => {
  //     try {
  //       const token = socket.handshake.auth.token;
  //       if (!token) {
  //         return next(new Error("Authentication error: Token missing"));
  //       }

  //       // Xác thực token
  //       const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //       // Tìm user
  //       const user = await prisma.user.findUnique({
  //         where: {
  //           id: decoded.id,
  //         },
  //       });

  //       if (!user) {
  //         return next(new Error("Authentication error: User not found"));
  //       }

  //       // Lưu thông tin user vào socket
  //       socket.user = {
  //         id: user.id,
  //         name: user.name,
  //         role: user.role,
  //       };

  //       next();
  //     } catch (error) {
  //       console.error("Socket authentication error:", error);
  //       next(new Error("Authentication error: Invalid token"));
  //     }
  //   });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`👤 ${socket.id} joined room: ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return ioInstance;
}

module.exports = {
  initSocket,
  getIO,
};
