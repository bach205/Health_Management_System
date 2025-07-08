const ConversationService = require("../services/conversation.service");
const ChatService = require("../services/chat.service");

class ConversationController {
    // Tạo conversation mới
    async createConversation(req, res) {
        try {
            const { name, type, participantIds } = req.body;
            const userId = req.user.id;

            // Kiểm tra dữ liệu đầu vào
            if (!participantIds || participantIds.length === 0) {
                return res.status(400).json({ message: "Cần ít nhất 1 participant" });
            }

            // Đảm bảo user hiện tại có trong danh sách participants
            if (!participantIds.includes(userId)) {
                participantIds.push(userId);
            }

            // Nếu là conversation 1-1, kiểm tra xem đã tồn tại chưa
            if (type === 'direct' && participantIds.length === 2) {
                const existingConversation = await ConversationService.findDirectConversation(
                    participantIds[0],
                    participantIds[1]
                );
                if (existingConversation) {
                    return res.json(existingConversation);
                }
            }

            const conversation = await ConversationService.createConversation({
                name,
                type,
                participantIds
            });

            res.status(201).json(conversation);
        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(500).json({ message: error.message || "Lỗi tạo conversation" });
        }
    }

    // Lấy tất cả conversation của user
    async getConversations(req, res) {
        try {
            const userId = req.user.id;
            const conversations = await ConversationService.getConversationsByUserId(userId);

            // Thêm số tin nhắn chưa đọc cho mỗi conversation
            const conversationsWithUnreadCount = await Promise.all(
                conversations.map(async (conversation) => {
                    const unreadCount = await ChatService.getUnreadCountByConversation(
                        conversation.id,
                        userId
                    );
                    return {
                        ...conversation,
                        unreadCount
                    };
                })
            );

            res.json(conversationsWithUnreadCount);
        } catch (error) {
            console.error("Error getting conversations:", error);
            res.status(500).json({ message: error.message || "Lỗi lấy danh sách conversation" });
        }
    }

    // Lấy conversation theo ID
    async getConversationById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const conversation = await ConversationService.getConversationById(id, userId);
            if (!conversation) {
                return res.status(404).json({ message: "Không tìm thấy conversation" });
            }

            res.json(conversation);
        } catch (error) {
            console.error("Error getting conversation:", error);
            res.status(500).json({ message: error.message || "Lỗi lấy conversation" });
        }
    }

    // Cập nhật conversation
    async updateConversation(req, res) {
        try {
            const { id } = req.params;
            const { name, participantIds } = req.body;
            const userId = req.user.id;

            // Kiểm tra quyền (chỉ admin hoặc người tạo conversation mới được sửa)
            const conversation = await ConversationService.getConversationById(id, userId);
            if (!conversation) {
                return res.status(404).json({ message: "Không tìm thấy conversation" });
            }

            const updatedConversation = await ConversationService.updateConversation(id, {
                name,
                participantIds
            });

            res.json(updatedConversation);
        } catch (error) {
            console.error("Error updating conversation:", error);
            res.status(500).json({ message: error.message || "Lỗi cập nhật conversation" });
        }
    }

    // Xóa conversation
    async deleteConversation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Kiểm tra quyền
            const conversation = await ConversationService.getConversationById(id, userId);
            if (!conversation) {
                return res.status(404).json({ message: "Không tìm thấy conversation" });
            }

            await ConversationService.deleteConversation(id);
            res.json({ message: "Xóa conversation thành công" });
        } catch (error) {
            console.error("Error deleting conversation:", error);
            res.status(500).json({ message: error.message || "Lỗi xóa conversation" });
        }
    }

    // Thêm participant vào conversation
    async addParticipant(req, res) {
        try {
            const { conversationId } = req.params;
            const { userId } = req.body;
            const currentUserId = req.user.id;

            // Kiểm tra quyền
            const conversation = await ConversationService.getConversationById(conversationId, currentUserId);
            if (!conversation) {
                return res.status(404).json({ message: "Không tìm thấy conversation" });
            }

            const participant = await ConversationService.addParticipant(conversationId, userId);
            res.json(participant);
        } catch (error) {
            console.error("Error adding participant:", error);
            res.status(500).json({ message: error.message || "Lỗi thêm participant" });
        }
    }

    // Xóa participant khỏi conversation
    async removeParticipant(req, res) {
        try {
            const { conversationId, userId } = req.params;
            const currentUserId = req.user.id;

            // Kiểm tra quyền
            const conversation = await ConversationService.getConversationById(conversationId, currentUserId);
            if (!conversation) {
                return res.status(404).json({ message: "Không tìm thấy conversation" });
            }

            await ConversationService.removeParticipant(conversationId, userId);
            res.json({ message: "Xóa participant thành công" });
        } catch (error) {
            console.error("Error removing participant:", error);
            res.status(500).json({ message: error.message || "Lỗi xóa participant" });
        }
    }

    // Tìm hoặc tạo conversation 1-1 giữa 2 user
    async findOrCreateDirectConversation(req, res) {
        try {
            const { userId1, userId2 } = req.params;
            // Kiểm tra quyền (user hiện tại phải là 1 trong 2 user)
            if (![userId1, userId2].includes(req.user.id.toString())) {
                return res.status(403).json({ message: 'No permission' });
            }

            let conversation = await ConversationService.findDirectConversation(
                parseInt(userId1),
                parseInt(userId2)
            );
            if (!conversation) {
                // Tạo mới nếu chưa có
                conversation = await ConversationService.createConversation({
                    name: null,
                    type: 'direct',
                    participantIds: [parseInt(userId1), parseInt(userId2)]
                });
            }
            res.json({ data: conversation });
        } catch (err) {
            res.status(500).json({ message: err.message || 'Error finding/creating direct conversation' });
        }
    }
}

module.exports = new ConversationController(); 