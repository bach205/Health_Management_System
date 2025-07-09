// notification.route.js
const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth');

notificationRouter.use(authenticate);

notificationRouter.post('/', notificationController.createNotification);
notificationRouter.get('/', notificationController.getNotifications);
notificationRouter.patch('/:id/read', notificationController.markAsRead);
notificationRouter.patch('/all/read', notificationController.markAllAsRead);
notificationRouter.delete('/:id', notificationController.deleteNotification);

module.exports = notificationRouter; 