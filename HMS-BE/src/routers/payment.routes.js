// payment.routes.js
const express = require("express");
const asyncHandler = require('../helper/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const paymentController = require("../controllers/payment.controller");
const paymentRouter = express.Router();


//     authenticate,
//     authorize("admin"),
paymentRouter.post(
    "/create-payment",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.createPayment)
)

paymentRouter.get(
    "/get-all-payments",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.getAllPayments)
);

paymentRouter.get(
    "/",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.getAllPayments)
);

paymentRouter.put(
    "/update-payment-status/:id",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.updatePaymentStatus)
);
paymentRouter.patch(
    "/update-status/:id",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.updatePaymentStatus)
);

paymentRouter.put(
    "/update-payment-medicine-status/:id",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.updatePaymentMedicineStatus)
);

paymentRouter.get(
    "/payment-record/:id",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.getPaymentByRecordId)
);

paymentRouter.get(
    "/appointment/:id",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.getInvoiceByAppointmentId)
);

paymentRouter.get(
    "/pending",
    // authenticate,
    // authorize("admin"),
    asyncHandler(paymentController.getPendingPayments)
);

// routes/payment.routes.ts
paymentRouter.post(
    "/webhook",
    asyncHandler(paymentController.webhook)
);




// patientRouter.post(
//     "/update-status",
//     authenticate,
//     authorize("admin"),
//     asyncHandler(patientController.changeActive)
// );


// paymentRouter.get('/create-payment', (req, res) => {

//     const paymentUrl = vnpay.buildPaymentUrl({
//         vnp_Amount: 100000, // Số tiền thanh toán (đơn vị: đồng)
//         vnp_IpAddr: '127.0.0.1',
//         vnp_ReturnUrl: 'http://localhost:8080/api/v1/payment/payment-return',
//         vnp_TxnRef: 'ORDER123', // Mã giao dịch duy nhất
//         vnp_OrderInfo: 'Thanh toán đơn hàng #123', // Thông tin chuyển khoản
//         vnp_CreateDate: dateFormat(new Date()),
//         vnp_ExpireDate: dateFormat(new Date(Date.now() + 60 * 60 * 1000)), // Hết hạn sau 60 phút
//         vnp_Locale: 'vn', // Ngôn ngữ hiển thị
//     });

//     res.json({ paymentUrl });
// });

// paymentRouter.get('/payment-return', (req, res) => {
//     const verify = vnpay.verifyReturnUrl(req.query);
//     if (verify.isSuccess) {
//         return res.send('✅ Thanh toán thành công!');
//     }
//     return res.send('❌ Thanh toán thất bại: ' + verify.message);
// });

module.exports = paymentRouter;