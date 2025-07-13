const socketIO = require("socket.io");
const prisma = require("./prisma")
const jwt = require('jsonwebtoken');
const ChatService = require('../services/chat.service');
const ConversationService = require('../services/conversation.service');
let ioInstance = null;

const authToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Lưu thông tin user vào socket
    socket.user = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication error: Invalid token"));
  }
}

const handleSocketConnected = (socket, io) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.join(`user_${socket.user.id}`);
  // Khi user join
  // socket.on('join', ({ userId }) => {
  //   console.log(`join user_${userId}`)
  //   socket.join(`user_${userId}`);
  // });

  // Gửi tin nhắn mới
  socket.on('send_message', async (data) => {
    try {
      data = { ...data, sendById: socket.user.id }
      const message = await ChatService.sendMessage(data);
      const conversation = await ConversationService.getConversationById(data.conversationId, data.sendById);
      if (conversation) {
        conversation.participants.forEach((p) => {
          io.to(`user_${p.userId}`).emit('new_message', message);
        });
      }
    } catch (err) {
      console.log(err)
      socket.emit('error', { message: 'Gửi tin nhắn thất bại' });
    }
  });

  // Sửa tin nhắn
  socket.on('edit_message', async ({ messageId, text }) => {
    console.log(text)
    try {
      const updated = await ChatService.updateMessage(messageId, { text }, socket.user.id);
      const conversationId = updated.conversationId;
      const conversation = await ConversationService.getConversationById(conversationId, updated.sendById);
      if (conversation) {
        conversation.participants.forEach((p) => {
          io.to(`user_${p.userId}`).emit('message_updated', updated);
        });
      }
    } catch (err) {
      console.log(err)
      socket.emit('error', { message: 'Sửa tin nhắn thất bại' });
    }
  });

  // Xóa tin nhắn
  socket.on('delete_message', async ({ messageId }) => {

    try {
      const message = await ChatService.getMessageById(messageId);
      await ChatService.deleteMessage(messageId, message.sendById);
      const conversation = await ConversationService.getConversationById(message.conversationId, message.sendById);
      if (conversation) {
        conversation.participants.forEach((p) => {
          io.to(`user_${p.userId}`).emit('message_deleted', messageId);
        });
      }
    } catch (err) {
      console.log(err)
      socket.emit('error', { message: 'Xóa tin nhắn thất bại' });
    }
  });

  // Sự kiện typing
  socket.on('typing', ({ conversationId, userId, isTyping }) => {
    ConversationService.getConversationById(conversationId, userId).then(conversation => {
      if (conversation) {
        conversation.participants.forEach((p) => {
          if (p.userId !== userId) {
            io.to(`user_${p.userId}`).emit('typing', { conversationId, userId, isTyping });
          }
        });
      }
    });
  });

  // Sự kiện read_message
  socket.on('read_message', async ({ conversationId, userId }) => {
    try {
      await ChatService.markConversationAsRead(conversationId, userId);
      const conversation = await ConversationService.getConversationById(conversationId, userId);
      if (conversation) {
        conversation.participants.forEach((p) => {
          if (p.userId !== userId) {
            io.to(`user_${p.userId}`).emit('read_message', { conversationId, userId });
          }
        });
      }
    } catch (err) {
      socket.emit('error', { message: 'Đánh dấu đã đọc thất bại' });
    }
  });

  // Sự kiện conversation_update (ví dụ: đổi tên, thêm/xóa participant)
  socket.on('conversation_update', async ({ conversationId, updaterId }) => {
    try {
      const conversation = await ConversationService.getConversationById(conversationId, updaterId);
      if (conversation) {
        conversation.participants.forEach((p) => {
          io.to(`user_${p.userId}`).emit('conversation_update', conversation);
        });
      }
    } catch (err) {
      socket.emit('error', { message: 'Cập nhật conversation thất bại' });
    }
  });
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`👤 ${socket.id} joined room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
}


function initSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(authToken);

  io.on("connection", (socket) => handleSocketConnected(socket, io));
  ioInstance = io;
  return io;
}

function getIO() {
  return ioInstance;
}

module.exports = {
  initSocket,
  getIO,
};
