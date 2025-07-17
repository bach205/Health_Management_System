import instance from "../api/instance";

// Lấy danh sách hóa đơn (Invoice + Payment)
export const getInvoiceList = async () => {
  return instance.get('/api/v1/invoices');
};

// Lấy chi tiết từng hóa đơn (InvoiceItem[])
export const getInvoiceDetail = async (record_id: number) => {
  return instance.get(`/api/v1/invoices/${record_id}`);
};

// Xác nhận đã thanh toán
export const confirmPayment = async (record_id: number) => {
  return instance.patch(`/api/v1/payments/${record_id}/confirm`);
};
