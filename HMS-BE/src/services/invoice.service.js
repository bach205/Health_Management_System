const prisma = require("../config/prisma");


class InvoiceService {
  // Lấy danh sách hóa đơn gộp từ record
  getInvoiceList = async () => {
    const records = await prisma.examinationRecord.findMany({
      include: {
        patient: {
            include: {
                user: true
            },
        },
        invoiceItems: true,
        payments: {
          select: {
            status: true,
          },
        },
  

      },
    });

    const data =  records.map((r) => {
      console.log(r.payments[0]?.status)
      if (r.payments[0]?.status === 'canceled' || r.payments[0]?.status === 'paid') {
        return null; // Bỏ qua các record đã hủy thanh toán
        
      }
      return {
        record_id: r.id,
        patient_name: r.patient.user.full_name,
        examined_at: r.examined_at,
        service_count: r.invoiceItems.length,
        total_amount: r.invoiceItems.reduce((sum, item) => sum + Number(item.amount), 0),
        status: r.payments[0]?.status,
      };
    }).filter(item => item !== null);
    console.log("Invoice data:", data);
    return data;
  };

  // Lấy chi tiết invoice items của 1 record
  getInvoiceDetail = async (record_id) => {

    const items = await prisma.invoiceItem.findMany({
      where: { record_id: Number(record_id) },
      orderBy: { created_at: 'asc' },
    });

    return items.map(i => ({
      id: i.id,
      description: i.description,
      amount: Number(i.amount),
    }));
  };
}

module.exports = new InvoiceService();
