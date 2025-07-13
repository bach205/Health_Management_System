// sepay.route.js
const express = require('express');
const sepayRouter = express.Router();
const sepayController = require('../controllers/sepay.controller');
const { authenticate } = require('../middlewares/auth');

// Tạo giao dịch (cần đăng nhập)
sepayRouter.post('/create', authenticate, sepayController.createTransaction);
// Callback từ sepay (không cần auth)
sepayRouter.post('/callback', sepayController.callback);
// Kiểm tra trạng thái giao dịch (cần đăng nhập)
sepayRouter.get('/status/:transactionId', authenticate, sepayController.getStatus);

module.exports = sepayRouter; 