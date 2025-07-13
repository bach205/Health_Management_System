const { CREATED, OK } = require("../core/success.response");
const statisticsService = require("../services/statistics.service");

class StatisticsController {

  getTopDoctors = async (req, res) => {
    const result = await statisticsService.getTopDoctors();
    return new OK({
      message: "Lấy danh sách bác sĩ hàng đầu thành công",
      metadata: result,
    }).send(res);
  }

  getPeriodStatistics = async (req, res) => {
    const query = req.query;
    const result = await statisticsService.getPeriodStatistics(query);
    return new OK({
      message: "Lấy thống kê theo khoảng thời gian thành công",
      metadata: result,
    }).send(res);
  };
}

module.exports = new StatisticsController();
