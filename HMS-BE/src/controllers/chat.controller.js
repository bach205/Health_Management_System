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

    // Upload multiple files for chat (multipart)
    async uploadFilesForChat(req, res) {
        try {
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                return res.status(400).json({ message: 'Không có file upload' });
            }
            const filesMeta = req.files.map(file => ({
                file_url: file.path.replace(/\\/g, '/'),
                file_name: file.originalname,
                file_type: file.mimetype
            }));
            res.json(filesMeta);
        } catch (error) {
            console.error('Error uploading files for chat:', error);
            res.status(500).json({ message: error.message || 'Lỗi upload file chat' });
        }
    }

    // Xóa file đã upload (hỗ trợ xóa 1 hoặc nhiều file)
    async deleteUploadedFile(req, res) {
        try {
            let fileUrls = req.body.file_url;
            if (!fileUrls) return res.status(400).json({ message: 'Thiếu file_url' });
            if (!Array.isArray(fileUrls)) fileUrls = [fileUrls];
            const path = require('path');
            const fs = require('fs');
            let deleted = 0;
            for (const url of fileUrls) {
                const filePath = path.isAbsolute(url) ? url : path.join(process.cwd(), url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    deleted++;
                }
            }
            res.json({ message: `Đã xóa ${deleted} file` });
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ message: error.message || 'Lỗi xóa file' });
        }
    }

    // Stream file từ file_url
    async streamFile(req, res) {
        try {
            const { filename } = req.params;
            const path = require('path');
            const fs = require('fs');

            // Tạo đường dẫn file từ filename
            const filePath = path.join(process.cwd(), 'uploads', 'chat', filename);

            // Kiểm tra file có tồn tại không
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'File không tồn tại' });
            }

            // Lấy thông tin file
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (range) {
                // Hỗ trợ range request cho video/audio streaming
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(filePath, { start, end });

                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'application/octet-stream',
                });
                file.pipe(res);
            } else {
                // Stream toàn bộ file
                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': 'application/octet-stream',
                    'Cache-Control': 'public, max-age=31536000', // Cache 1 năm
                });
                fs.createReadStream(filePath).pipe(res);
            }
        } catch (error) {
            console.error('Error streaming file:', error);
            res.status(500).json({ message: error.message || 'Lỗi stream file' });
        }
    }
}

module.exports = new ChatController(); 