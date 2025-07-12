// sepay.service.js
const axios = require('axios');
const prisma = require('../config/prisma');

const SEPAY_API_URL = process.env.SEPAY_API_URL || 'https://api.sepay.vn';
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || '';
//demo mai code tiep
class SepayService {
    async createTransaction({ userId, amount, orderInfo }) {
        // Gọi API sepay để tạo giao dịch
        const res = await axios.post(`${SEPAY_API_URL}/payment/create`, {
            amount,
            orderInfo,

        }, {
            headers: { 'Authorization': `Bearer ${SEPAY_API_KEY}` }
        });
        const transaction = await prisma.tbTransaction.create({
            data: {
                code: res.data.transactionId,
                userId,
                amount_in: amount,
                status: 'pending',
                transaction_content: orderInfo
            }
        });
        return transaction;
    }

    async updateTransactionStatus(transactionId, status) {
        return prisma.tbTransaction.update({
            where: { code: transactionId },
            data: { status }
        });
    }

    async getTransactionStatus(transactionId) {
        return prisma.tbTransaction.findUnique({
            where: { code: transactionId }
        });
    }
    verifyCallback(payload, signature) {

        return true;
    }
}

module.exports = new SepayService(); 