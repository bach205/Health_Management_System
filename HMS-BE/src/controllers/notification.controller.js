// notification.controller.js
const NotificationService = require('../services/notification.service');

class NotificationController {
    async createNotification(req, res, next) {
        try {
            const notification = await NotificationService.createNotification(req.body);
            res.status(201).json(notification);
        } catch (err) {
            next(err);
        }
    }

    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const { limit, offset } = req.query
            const notifications = await NotificationService.getNotificationsByUser(userId, Number(offset), Number(limit));
            res.status(200).json(notifications);
        } catch (err) {
            next(err);
        }
    }

    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;
            const notification = await NotificationService.markAsRead(id);
            res.status(200).json(notification);
        } catch (err) {
            next(err);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            console.log(req.user)
            const notification = await NotificationService.markAllAsRead(req.user.id);
            res.status(200).json(notification);
        } catch (err) {
            next(err);
        }
    }

    async deleteNotification(req, res, next) {
        try {
            const { id } = req.params;
            await NotificationService.deleteNotification(Number(id));
            res.status(204).end();
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new NotificationController(); 