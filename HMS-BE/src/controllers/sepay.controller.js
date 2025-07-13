// sepay.controller.js
const sepayService = require('../services/sepay.service');

class SepayController {
    async createTransaction(req, res, next) {
        try {
            const { amount, orderInfo } = req.body;
            const userId = req.user.id;
            const transaction = await sepayService.createTransaction({ userId, amount, orderInfo });
            res.status(201).json(transaction);
        } catch (err) {
            next(err);
        }
    }

    async callback(req, res, next) {
        try {
            const { transactionId, status, signature } = req.body;
            // Xác thực callback nếu cần
            if (!sepayService.verifyCallback(req.body, signature)) {
                return res.status(400).json({ message: 'Invalid signature' });
            }
            await sepayService.updateTransactionStatus(transactionId, status);
            res.status(200).json({ message: 'OK' });
        } catch (err) {
            next(err);
        }
    }

    async getStatus(req, res, next) {
        try {
            const { transactionId } = req.params;
            const transaction = await sepayService.getTransactionStatus(transactionId);
            if (!transaction) return res.status(404).json({ message: 'Not found' });
            res.status(200).json(transaction);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new SepayController(); 