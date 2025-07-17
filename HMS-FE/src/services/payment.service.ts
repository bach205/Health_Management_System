import instance from "../api/instance";

// Lấy danh sách hóa đơn (Invoice + Payment)
export const getInvoiceList = async () => {
  return instance.get('/api/v1/invoice');
};

// Lấy chi tiết từng hóa đơn (InvoiceItem[])
export const getInvoiceDetail = async (record_id: number) => {
  return instance.get(`/api/v1/invoice/${record_id}`);
};

// Xác nhận thanh toán cho một hóa đơn
export const confirmPayment = async (record_id: number) => {
  return instance.patch(`/api/v1/payment/update-status/${record_id}`);
};


export const updatePaymentStatus = async (record_id: number, status: string) => {
  return instance.patch(`/api/v1/payment/update-status/${record_id}`, { status });
};