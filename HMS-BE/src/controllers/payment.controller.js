const { CREATED, OK } = require("../core/success.response");
const paymentService = require("../services/payment.service");

class PaymentController {
  createPayment = async (req, res) => {
    const paymentData = req.body;
    const result = await paymentService.createPayment(paymentData);
    return new CREATED({
      message: "Tạo mới thanh toán thành công",
      metadata: result,
    }).send(res);
  };

  getAllPayments = async (req, res) => {
    const payments = await paymentService.getAllPayments(req.query);
    return new OK({
      message: "Lấy danh sách thanh toán thành công",
      metadata: payments,
    }).send(res);
  }

  updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await paymentService.updatePaymentStatus(id, status);
    return new OK({
      message: "Cập nhật trạng thái thanh toán thành công",
      metadata: result,
    }).send(res);
  };

  getPaymentById = async (req, res) => {
    const { id } = req.params;
    const result = await paymentService.getPaymentById(id);
    return new OK({
      message: "Lấy thông tin thanh toán thành công",
      metadata: result,
    }).send(res);
  };

}

module.exports = new PaymentController();
