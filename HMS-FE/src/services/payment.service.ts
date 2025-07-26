import instance from "../api/instance";

// Lấy danh sách hóa đơn (Invoice + Payment)
export const getInvoiceList = async () => {
  return instance.get('/api/v1/invoice');
};

// Lấy chi tiết từng hóa đơn (InvoiceItem[])
export const getInvoiceDetail = async (record_id: number) => {
  return instance.get(`/api/v1/invoice/${record_id}`);
};
export const getInvoiceDetailByAppointmentId = async (appointment_id: number) => {
  return instance.get(`/api/v1/invoice/appointment/${appointment_id}`);
};

// Cập nhật hóa đơn
export const updateInvoice = async (record_id: number | undefined, items: any[]) => {
 
  return instance.patch(`/api/v1/invoice/${record_id}`, { items });
};

// Xác nhận thanh toán cho một hóa đơn
export const confirmPayment = async (record_id: number) => {
  return instance.patch(`/api/v1/payment/update-status/${record_id}`);
};

export const getPaymentByRecordId = async (record_id: number) => {
  return instance.get(`/api/v1/payment/payment-record/${record_id}`);
};



export const updatePaymentMedicineStatus = async (record_id: number, status: string) => {
  return instance.put(`/api/v1/payment/update-payment-medicine-status/${record_id}`, { status });
};

export const updatePaymentStatus = async (record_id: number, status: string) => {
  return instance.patch(`/api/v1/payment/update-status/${record_id}`, { status });
};

// Lấy danh sách payment đang pending
export const getPendingPayments = async () => {
  return instance.get('/api/v1/payment/pending');
};

export const getAllPayments = async (params: any) => {
  return instance.get('/api/v1/payment', { params });
};
