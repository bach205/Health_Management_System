const { CREATED, OK } = require("../core/success.response");
const statisticsService = require("../services/statistics.service");

class StatisticsController {

  getTopDoctors = async (req, res) => {
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: 100000,
      vnp_IpAddr: req.ip,
      vnp_ReturnUrl: 'http://localhost:8080/api/v1/payment/payment-return',
      vnp_TxnRef: 'ORDER123',
      vnp_OrderInfo: 'Thanh toán đơn hàng #123',
    });
  
    res.json({ paymentUrl });
//   });
    // return new OK({
    //   message: "Lấy danh sách bác sĩ hàng đầu thành công",
    //   metadata: result,
    // }).send(res);
  }

  getPeriodStatistics = async (req, res) => {
    console.log(req.query)
    const query = req.query;
    const result = await statisticsService.getPeriodStatistics(query);
    return new OK({
      message: "Lấy thống kê theo khoảng thời gian thành công",
      metadata: result,
    }).send(res);
  };

}

module.exports = new StatisticsController();
