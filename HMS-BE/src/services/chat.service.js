const prisma = require("../config/prisma");

class ChatService {
    // Gửi tin nhắn mới
    // Gửi tin nhắn mới
    async sendMessage(data) {
        const {
            text,
            file_url,
            file_name,
            file_type,
            message_type,
            toId,
            sendById,
            conversationId
        } = data;

        // lấy loại conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { type: true }
        });

        // chuẩn bị dữ liệu gửi
        const chatData = {
            text,
            file_url,
            file_name,
            file_type,
            message_type: message_type || 'text',
            sendById,
            conversationId
        };

        if (conversation.type === 'direct') {
            if (!toId) throw new Error("toId is required for direct message");
            chatData.toId = toId;
        } else {
            // group: để toId là sendById để tránh null lỗi Prisma
            chatData.toId = sendById;
        }

        // tạo tin nhắn
        const chat = await prisma.chat.create({
            data: chatData,
            include: {
                sendBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                },
                to: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        // cập nhật last_message_at
        await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                last_message_at: new Date()
            }
        });

        return chat;
    }


    // Lấy tin nhắn theo conversation
    async getMessagesByConversationId(conversationId, userId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(conversationId) },
            select: { type: true }
        });
        const messages = await prisma.chat.findMany({
            where: {
                conversationId: parseInt(conversationId)
            },
            include: {
                sendBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                },
                to: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            skip,
            take: limit
        });

        // Đánh dấu tin nhắn đã đọc cho user hiện tại
        if (conversation.type === 'direct') {
            await prisma.chat.updateMany({
                where: {
                    conversationId: parseInt(conversationId),
                    toId: userId,
                    is_read: false
                },
                data: {
                    is_read: true
                }
            });
        } else {
            await prisma.chat.updateMany({
                where: {
                    conversationId: parseInt(conversationId),
                    is_read: false
                },
                data: {
                    is_read: true
                }
            });
        }

        return messages.reverse(); // Trả về theo thứ tự thời gian tăng dần
    }

    // Lấy tin nhắn chưa đọc của user
    async getUnreadMessages(userId) {
        const messages = await prisma.chat.findMany({
            where: {
                toId: userId,
                is_read: false
            },
            include: {
                sendBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                },
                conversation: {
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        full_name: true,
                                        email: true,
                                        avatar: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return messages;
    }

    // Đánh dấu tin nhắn đã đọc
    async markMessageAsRead(messageId, userId) {
        const message = await prisma.chat.update({
            where: {
                id: parseInt(messageId),
                toId: userId
            },
            data: {
                is_read: true
            },
            include: {
                sendBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        return message;
    }

    // Đánh dấu tất cả tin nhắn trong conversation đã đọc
    async markConversationAsRead(conversationId, userId) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(conversationId) },
            select: { type: true }
        });

        if (conversation.type === 'direct') {
            await prisma.chat.updateMany({
                where: {
                    conversationId: parseInt(conversationId),
                    toId: userId,
                    is_read: false
                },
                data: {
                    is_read: true
                }
            });
        } else {
            await prisma.chat.updateMany({
                where: {
                    conversationId: parseInt(conversationId),
                    is_read: false
                },
                data: {
                    is_read: true
                }
            });
        }


        return { message: "All messages marked as read" };
    }

    // Cập nhật tin nhắn
    async updateMessage(messageId, data, userId) {
        const { text, file_url, file_name, file_type, message_type } = data;

        const message = await prisma.chat.update({
            where: {
                id: parseInt(messageId),
                sendById: userId // Chỉ người gửi mới được sửa
            },
            data: {
                text,
                file_url,
                file_name,
                file_type,
                message_type,
                updated_at: new Date()
            },
            include: {
                sendBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        return message;
    }

    // Xóa tin nhắn
    async deleteMessage(messageId, userId) {
        await prisma.chat.delete({
            where: {
                id: parseInt(messageId),
                sendById: userId // Chỉ người gửi mới được xóa
            }
        });

        return { message: "Message deleted successfully" };
    }

    // Lấy số tin nhắn chưa đọc theo conversation
    async getUnreadCountByConversation(conversationId, userId) {
        const count = await prisma.chat.count({
            where: {
                conversationId: parseInt(conversationId),
                toId: userId,
                is_read: false
            }
        });

        return count;
    }

    // Lấy tổng số tin nhắn chưa đọc của user
    async getTotalUnreadCount(userId) {
        const count = await prisma.chat.count({
            where: {
                toId: userId,
                is_read: false
            }
        });

        return count;
    }

    // Tìm kiếm tin nhắn
    async searchMessages(conversationId, searchTerm, userId) {
        const messages = await prisma.chat.findMany({
            where: {
                conversationId: parseInt(conversationId),
                text: {
                    contains: searchTerm
                }
            },
            include: {
                sendBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return messages;
    }
    async getMessageById(messageById) {
        console.log(messageById)
        const message = await prisma.chat.findFirst({
            where: {
                id: messageById
            },
            include: {
                sendBy: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                },
                to: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        return message;
    }
}

module.exports = new ChatService(); 