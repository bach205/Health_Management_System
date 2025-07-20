const { getIO } = require("../config/socket");
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
  updatePaymentMedicineStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;


    const result = await paymentService.updatePaymentMedicineStatus(id, status);
    return new OK({
      message: "Cập nhật trạng thái thanh toán thành công",
      metadata: result,
    }).send(res);
  };

  getPaymentByRecordId = async (req, res) => {
    const { id } = req.params;

    const result = await paymentService.getPaymentByRecordId(id);
    return new OK({
      message: "Lấy status của payment thành công",
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

  getPendingPayments = async (req, res) => {
    const payments = await paymentService.getPendingPayments();
    return new OK({
      message: "Lấy danh sách thanh toán đang chờ thành công",
      metadata: payments,
    }).send(res);
  };

  webhook = async (req, res) => {
    try {
      const {
        subAccount,
        transactionDate,
        transferAmount,
        description,
        referenceCode,
      } = req.body;
  
      const invoice = await paymentService.webhook(req.body);
      // Trích xuất thông tin từ description
     
      console.log("Đã xác nhận thanh toán cho invoice", invoice.id);
      return res.status(200).json({ message: "Payment confirmed" });
  
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({ message: "Internal error" });
    }
  };
  

}

module.exports = new PaymentController();
