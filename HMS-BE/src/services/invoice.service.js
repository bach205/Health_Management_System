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

    const data = records.map((r) => {
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

  // Lấy hóa đơn theo id lịch hẹn
  getInvoiceByAppointmentId = async (id) => {
    if (!id) throw new Error("Appointment ID phải tồn tại");

    // Lấy appointment_id từ lịch hẹn
    const invoice = await prisma.examinationRecord.findFirst({
      where: { appointment_id: Number(id) },
      include: {
        invoiceItems: true,
        patient: {
          include: {
            user: true,
          },
        },
      },
    });
    return invoice;
  }

  // Cập nhật hóa đơn
  updateInvoice = async (record_id, items) => {
    const invoice = await prisma.invoiceItem.deleteMany({
      where: { record_id: Number(record_id) },
    });
    const invoiceItems = await prisma.invoiceItem.createMany({
      data: items.map(item => ({
        record_id: Number(record_id),
        description: item.description,
        amount: item.amount,
      })),
    });
    // console.log(invoiceItems)
    const total_amount = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const payment = await prisma.payment.findFirst({
      where: { record_id: Number(record_id) },
    });
    if (!payment) {
      return new Error("Không tìm thấy thanh toán");
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        amount: total_amount,
      },
    });
    return invoiceItems;
  }
}

module.exports = new InvoiceService();
