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
    console.log(req.query)
    const query = req.query;
    const result = await statisticsService.getPeriodStatistics(query);
    return new OK({
      message: "Lấy thống kê theo khoảng thời gian thành công",
      metadata: result,
    }).send(res);
  };

  getRevenuePerDayInMonth = async (req, res) => {
    const { month, year } = req.query;
    const result = await statisticsService.getRevenuePerDayInMonth(month, year);
    return new OK({
      message: "Lấy doanh thu theo ngày trong tháng thành công",
      metadata: result,
    }).send(res);
  };

  getRevenuePerMonthInYear = async (req, res) => {
    const { year } = req.query;
    const result = await statisticsService.getRevenuePerMonthInYear(year);
    return new OK({
      message: "Lấy doanh thu theo tháng trong năm thành công",
      metadata: result,
    }).send(res);
  };

  getTotalStatistics = async (req, res) => {
    const result = await statisticsService.getTotalStatistics();
    return new OK({
      message: "Lấy tổng thống kê thành công",
      metadata: result,
    }).send(res);
  };
}

module.exports = new StatisticsController();
