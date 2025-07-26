const InvoiceService = require("../services/invoice.service");
const { OK } = require("../core/success.response");

class InvoiceController {
  getInvoiceList = async (req, res) => {
    const data = await InvoiceService.getInvoiceList();
    return new OK({ message: "Lấy danh sách hóa đơn thành công", metadata: data }).send(res);
  };

  getInvoiceDetail = async (req, res) => {
    const record_id = req.params.record_id;
    const data = await InvoiceService.getInvoiceDetail(record_id);
    return new OK({ message: "Lấy chi tiết hóa đơn thành công", metadata: data }).send(res);
  };

  getInvoiceByAppointmentId = async (req, res) => {
    const { id } = req.params;
    const result = await InvoiceService.getInvoiceByAppointmentId(id);
    return new OK({
      message: "Lấy hóa đơn thành công",
      metadata: result,
    }).send(res);
  };

  updateInvoice = async (req, res) => {
    const { record_id } = req.params;
    const { items } = req.body;
    const data = await InvoiceService.updateInvoice(record_id, items);
    return new OK({ message: "Cập nhật hóa đơn thành công", metadata: data }).send(res);
  };
}

module.exports = new InvoiceController();
