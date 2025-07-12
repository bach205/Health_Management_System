const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const ConversationController = require("../controllers/conversation.controller");

const router = express.Router();

// Tất cả routes đều cần authenticate
router.use(authenticate);

// Conversation routes
router.post("/", ConversationController.createConversation);
router.get("/", ConversationController.getConversations);
router.get("/:id", ConversationController.getConversationById);
router.put("/:id", ConversationController.updateConversation);
router.delete("/:id", ConversationController.deleteConversation);

// Participant routes
router.post("/:conversationId/participants", ConversationController.addParticipant);
router.delete("/:conversationId/participants/:userId", ConversationController.removeParticipant);

// Tìm hoặc tạo conversation 1-1
router.get("/direct/:userId1/:userId2", ConversationController.findOrCreateDirectConversation);

module.exports = router; 