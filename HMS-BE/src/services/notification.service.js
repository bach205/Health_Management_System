// notification.service.js
const prisma = require('../config/prisma');
const { getIO } = require('../config/socket');

class NotificationService {

    async createNotification(notification) {
        const io = getIO()
        const created = await prisma.notificationItems.create({
            data: {
                message: notification.message,
                isSeen: false,
                navigate_url: notification.navigate_url || "/",
                userId: notification.userId
            }
        });
        // Emit socket event tới user
        io.to(`user_${created.userId}`).emit("send_notification", created);
        return created;
    }

    async getNotificationsByUser(userId, offset = 0, limit = 15) {
        return prisma.notificationItems.findMany({
            where: { userId },
            orderBy: { created_at: 'desc' },
            skip: offset,        // offset
            take: limit,         // limit
        });
    }

    async markAsRead(notificationId) {
        return prisma.notificationItems.update({
            where: { id: notificationId },
            data: { isSeen: true },
        });
    }

    async markAllAsRead(userId) {
        return prisma.notificationItems.updateMany({
            where: {
                userId: userId,
                isSeen: false,
            },
            data: {
                isSeen: true,
            },
        });
    }


    async deleteNotification(notificationId) {
        return prisma.notificationItems.delete({
            where: { id: notificationId },
        });
    }
}

module.exports = new NotificationService(); 