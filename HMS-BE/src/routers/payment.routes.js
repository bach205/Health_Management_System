// payment.routes.js
const express = require("express");
const vnpay = require("../config/vnpayClient");
const { dateFormat } = require("vnpay");
const paymentRouter = express.Router();

paymentRouter.get('/create-payment', (req, res) => {

    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: 100000, // Số tiền thanh toán (đơn vị: đồng)
        vnp_IpAddr: '127.0.0.1',
        vnp_ReturnUrl: 'http://localhost:8080/api/v1/payment/payment-return',
        vnp_TxnRef: 'ORDER123', // Mã giao dịch duy nhất
        vnp_OrderInfo: 'Thanh toán đơn hàng #123', // Thông tin chuyển khoản
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(new Date(Date.now() + 60 * 60 * 1000)), // Hết hạn sau 60 phút
        vnp_Locale: 'vn', // Ngôn ngữ hiển thị
    });

    res.json({ paymentUrl });
});

paymentRouter.get('/payment-return', (req, res) => {
    const verify = vnpay.verifyReturnUrl(req.query);
    if (verify.isSuccess) {
        return res.send('✅ Thanh toán thành công!');
    }
    return res.send('❌ Thanh toán thất bại: ' + verify.message);
});

module.exports = paymentRouter;