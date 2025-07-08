const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const ChatController = require("../controllers/chat.controller");

const router = express.Router();

// Tất cả routes đều cần authenticate
router.use(authenticate);

// Chat routes
router.post("/", ChatController.sendMessage);
router.get("/conversation/:conversationId", ChatController.getMessagesByConversation);
router.get("/unread", ChatController.getUnreadMessages);
router.put("/:messageId/read", ChatController.markMessageAsRead);
router.put("/conversation/:conversationId/read", ChatController.markConversationAsRead);
router.put("/:messageId", ChatController.updateMessage);
router.delete("/:messageId", ChatController.deleteMessage);

// Unread count routes
router.get("/conversation/:conversationId/unread-count", ChatController.getUnreadCountByConversation);
router.get("/total-unread-count", ChatController.getTotalUnreadCount);

// Search routes
router.get("/conversation/:conversationId/search", ChatController.searchMessages);

module.exports = router; 