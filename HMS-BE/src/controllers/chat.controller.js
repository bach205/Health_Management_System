const ChatService = require("../services/chat.service");
const ConversationService = require("../services/conversation.service");

class ChatController {
    // Gửi tin nhắn mới
    async sendMessage(req, res) {
        try {
            const { text, file_url, file_name, file_type, message_type, toId, conversationId } = req.body;
            const sendById = req.user.id;

            // Kiểm tra dữ liệu đầu vào
            if (!conversationId) {
                return res.status(400).json({ message: "Thiếu conversationId" });
            }

            if (!text && !file_url) {
                return res.status(400).json({ message: "Tin nhắn không được để trống" });
            }

            // Kiểm tra quyền truy cập conversation
            const conversation = await ConversationService.getConversationById(conversationId, sendById);
            if (!conversation) {
                return res.status(403).json({ message: "Không có quyền truy cập conversation này" });
            }

            const message = await ChatService.sendMessage({
                text,
                file_url,
                file_name,
                file_type,
                message_type,
                toId,
                sendById,
                conversationId
            });

            res.status(201).json(message);
        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ message: error.message || "Lỗi gửi tin nhắn" });
        }
    }

    // Lấy tin nhắn theo conversation
    async getMessagesByConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const userId = req.user.id;

            // Kiểm tra quyền truy cập conversation
            const conversation = await ConversationService.getConversationById(conversationId, userId);
            if (!conversation) {
                return res.status(403).json({ message: "Không có quyền truy cập conversation này" });
            }

            const messages = await ChatService.getMessagesByConversationId(
                conversationId,
                userId,
                parseInt(page),
                parseInt(limit)
            );

            res.json(messages);
        } catch (error) {
            console.error("Error getting messages:", error);
            res.status(500).json({ message: error.message || "Lỗi lấy tin nhắn" });
        }
    }

    // Lấy tin nhắn chưa đọc
    async getUnreadMessages(req, res) {
        try {
            const userId = req.user.id;
            const messages = await ChatService.getUnreadMessages(userId);
            res.json(messages);
        } catch (error) {
            console.error("Error getting unread messages:", error);
            res.status(500).json({ message: error.message || "Lỗi lấy tin nhắn chưa đọc" });
        }
    }

    // Đánh dấu tin nhắn đã đọc
    async markMessageAsRead(req, res) {
        try {
            const { messageId } = req.params;
            const userId = req.user.id;

            const message = await ChatService.markMessageAsRead(messageId, userId);
            res.json(message);
        } catch (error) {
            console.error("Error marking message as read:", error);
            res.status(500).json({ message: error.message || "Lỗi đánh dấu tin nhắn đã đọc" });
        }
    }

    // Đánh dấu tất cả tin nhắn trong conversation đã đọc
    async markConversationAsRead(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;

            // Kiểm tra quyền truy cập conversation
            const conversation = await ConversationService.getConversationById(conversationId, userId);
            if (!conversation) {
                return res.status(403).json({ message: "Không có quyền truy cập conversation này" });
            }

            const result = await ChatService.markConversationAsRead(conversationId, userId);
            res.json(result);
        } catch (error) {
            console.error("Error marking conversation as read:", error);
            res.status(500).json({ message: error.message || "Lỗi đánh dấu conversation đã đọc" });
        }
    }

    // Cập nhật tin nhắn
    async updateMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { text, file_url, file_name, file_type, message_type } = req.body;
            const userId = req.user.id;

            const message = await ChatService.updateMessage(messageId, {
                text,
                file_url,
                file_name,
                file_type,
                message_type
            }, userId);

            res.json(message);
        } catch (error) {
            console.error("Error updating message:", error);
            res.status(500).json({ message: error.message || "Lỗi cập nhật tin nhắn" });
        }
    }

    // Xóa tin nhắn
    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const userId = req.user.id;

            await ChatService.deleteMessage(messageId, userId);
            res.json({ message: "Xóa tin nhắn thành công" });
        } catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ message: error.message || "Lỗi xóa tin nhắn" });
        }
    }

    // Lấy số tin nhắn chưa đọc theo conversation
    async getUnreadCountByConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;

            // Kiểm tra quyền truy cập conversation
            const conversation = await ConversationService.getConversationById(conversationId, userId);
            if (!conversation) {
                return res.status(403).json({ message: "Không có quyền truy cập conversation này" });
            }

            const count = await ChatService.getUnreadCountByConversation(conversationId, userId);
            res.json({ unreadCount: count });
        } catch (error) {
            console.error("Error getting unread count:", error);
            res.status(500).json({ message: error.message || "Lỗi lấy số tin nhắn chưa đọc" });
        }
    }

    // Lấy tổng số tin nhắn chưa đọc của user
    async getTotalUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await ChatService.getTotalUnreadCount(userId);
            res.json({ totalUnreadCount: count });
        } catch (error) {
            console.error("Error getting total unread count:", error);
            res.status(500).json({ message: error.message || "Lỗi lấy tổng số tin nhắn chưa đọc" });
        }
    }

    // Tìm kiếm tin nhắn
    async searchMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const { searchTerm } = req.query;
            const userId = req.user.id;

            if (!searchTerm) {
                return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
            }

            // Kiểm tra quyền truy cập conversation
            const conversation = await ConversationService.getConversationById(conversationId, userId);
            if (!conversation) {
                return res.status(403).json({ message: "Không có quyền truy cập conversation này" });
            }

            const messages = await ChatService.searchMessages(conversationId, searchTerm, userId);
            res.json(messages);
        } catch (error) {
            console.error("Error searching messages:", error);
            res.status(500).json({ message: error.message || "Lỗi tìm kiếm tin nhắn" });
        }
    }
}

module.exports = new ChatController(); 