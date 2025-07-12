const prisma = require("../config/prisma");

class ConversationService {
    // Tạo conversation mới
    async createConversation(data) {
        const { name, type, participantIds } = data;

        const conversation = await prisma.conversation.create({
            data: {
                name,
                type: type || 'direct',
                participants: {
                    create: participantIds.map(userId => ({
                        userId
                    }))
                }
            },
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
        });

        return conversation;
    }

    // Lấy tất cả conversation của user
    async getConversationsByUserId(userId) {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId
                    }
                }
            },
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
                },
                chats: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                last_message_at: 'desc'
            }
        });

        return conversations;
    }

    // Lấy conversation theo ID
    async getConversationById(id, userId) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: parseInt(id),
                participants: {
                    some: {
                        userId
                    }
                }
            },
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
        });
        return conversation;
    }

    // Cập nhật conversation
    async updateConversation(id, data) {
        const { name, participantIds } = data;

        // Xóa participants cũ nếu có
        if (participantIds) {
            await prisma.conversationParticipant.deleteMany({
                where: {
                    conversationId: parseInt(id)
                }
            });
        }

        const conversation = await prisma.conversation.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name,
                ...(participantIds && {
                    participants: {
                        create: participantIds.map(userId => ({
                            userId
                        }))
                    }
                })
            },
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
        });

        return conversation;
    }

    // Xóa conversation
    async deleteConversation(id) {
        await prisma.conversation.delete({
            where: {
                id: parseInt(id)
            }
        });

        return { message: "Conversation deleted successfully" };
    }

    // Tìm conversation 1-1 giữa 2 user
    async findDirectConversation(userId1, userId2) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                type: 'direct',
                participants: {
                    every: {
                        userId: {
                            in: [userId1, userId2]
                        }
                    }
                }
            },
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
        });

        return conversation;
    }

    // Thêm participant vào conversation
    async addParticipant(conversationId, userId) {
        const participant = await prisma.conversationParticipant.create({
            data: {
                conversationId: parseInt(conversationId),
                userId: parseInt(userId)
            },
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
        });

        return participant;
    }

    // Xóa participant khỏi conversation
    async removeParticipant(conversationId, userId) {
        await prisma.conversationParticipant.delete({
            where: {
                conversationId_userId: {
                    conversationId: parseInt(conversationId),
                    userId: parseInt(userId)
                }
            }
        });

        return { message: "Participant removed successfully" };
    }
}

module.exports = new ConversationService(); 