// notification.service.js
const prisma = require('../config/prisma');

class NotificationService {
    async createNotification(data) {
        return prisma.notification.create({ data });
    }

    async getNotificationsByUser(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(notificationId) {
        return prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    async deleteNotification(notificationId) {
        return prisma.notification.delete({
            where: { id: notificationId },
        });
    }
}

module.exports = new NotificationService(); 