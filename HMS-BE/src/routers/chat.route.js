const express = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const ChatController = require("../controllers/chat.controller");
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/chat/');
    },
    filename: function (req, file, cb) {
        // Ép lại encoding đúng nếu bị lỗi Unicode
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        // Làm sạch tên file (nếu muốn)
        const safeName = originalName.replace(/\s+/g, '_');
        file.originalname = safeName;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + safeName);
    }
});
const upload = multer({ storage });

const router = express.Router();

// Stream file route - không cần authenticate vì cần truy cập từ frontend
router.get('/stream/:filename', ChatController.streamFile);

// Tất cả routes đều cần authenticate
router.use(authenticate);

// Chat routes
router.post("/", ChatController.sendMessage);
router.get("/conversation/:conversationId", ChatController.getMessagesByConversation);
router.get("/unread", ChatController.getUnreadMessages);
router.put("/:messageId/read", ChatController.markMessageAsRead);
router.put("/conversation/:conversationId/read", ChatController.markConversationAsRead);
// router.put("/:messageId", ChatController.updateMessage);
// router.delete("/:messageId", ChatController.deleteMessage);

// Upload multiple files for chat (multipart)
router.post('/upload', upload.array('files'), ChatController.uploadFilesForChat);
// Xóa file đã upload khi user xóa khỏi preview
router.delete('/upload', ChatController.deleteUploadedFile);

// Unread count routes
router.get("/conversation/:conversationId/unread-count", ChatController.getUnreadCountByConversation);
router.get("/total-unread-count", ChatController.getTotalUnreadCount);

// Search routes
router.get("/conversation/:conversationId/search", ChatController.searchMessages);

// Stream file or image from message
router.get('/file/:messageId', ChatController.streamFileFromMessage);

// Upload multiple files for chat (multipart)
router.post('/upload', upload.array('files'), ChatController.uploadFilesForChat);

// Xóa file đã upload khi user xóa khỏi preview
router.delete('/upload', ChatController.deleteUploadedFile);

module.exports = router; 