const prisma = require("../config/prisma");

class PaymentService {

  async createInvoiceAndPaymentAfterExamination(record, appointment_id, doctor_id, patient_id) {
    // 1. Lấy giá bác sĩ
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { user_id: doctor_id },
      });

      const doctorPrice = doctor?.price ?? 0;

      // 2. Lấy danh sách ExaminationOrder liên quan đến appointment
      const orders = await prisma.examinationOrder.findMany({
        where: { appointment_id },
      });

      // 3. Tạo danh sách InvoiceItem
      const invoiceItemsData = [];

      // 3.1. Thêm phí bác sĩ
      invoiceItemsData.push({
        record_id: record.id,
        description: "Phí khám bác sĩ",
        amount: doctorPrice,
      });
      const fromClinic = await prisma.clinic.findUnique({
        where: { id: orders[0].from_clinic_id },
      });
      const toClinic = await prisma.clinic.findUnique({
        where: { id: orders[0].to_clinic_id },
      });

      // 3.2. Thêm từng dịch vụ từ ExaminationOrder
      for (const order of orders) {
        console.log("order", order)
        invoiceItemsData.push({
          record_id: record.id,
          description: `Chi phí dịch vụ từ phòng khám ${fromClinic.name} đến ${toClinic.name}`,
          amount: order.extra_cost,
        });
      }

      // 4. Tạo InvoiceItem[]
      await prisma.invoiceItem.createMany({
        data: invoiceItemsData,
      });

      // 5. Tính tổng tiền
      const totalAmount = invoiceItemsData.reduce((sum, item) => sum + Number(item.amount), 0);

      // 6. Tạo Payment trạng thái pending
      await prisma.payment.create({
        data: {
          patient_id,
          record_id: record.id,
          amount: totalAmount,
          status: "pending",
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  // getAllPayments = async (query) => {
  //     const { page = 1, limit = 10, ...filters } = query;
  //     const skip = (page - 1) * limit;

  //     const payments = await prisma.payment.findMany({
  //         where: filters,
  //         skip,
  //         take: limit,
  //         orderBy: { payment_time: "desc" },
  //     });

  //     const totalCount = await prisma.payment.count({ where: filters });

  //     return {
  //         payments,
  //         totalCount,
  //         totalPages: Math.ceil(totalCount / limit),
  //         currentPage: page,
  //     };
  // };
  getAllPayments = async (query) => {
    const { page = 1, limit = 10, name, status, sort } = query;
    const skip = (page - 1) * limit;

    const filters = {};

    if (status) filters.status = status;

    const payments = await prisma.payment.findMany({
      where: {
        ...filters,
        patient: name ? {
          user: {
            full_name: {
              contains: name,
              // mode: 'insensitive',
            }
          }
        } : undefined,
      },
      skip,
      take: +limit,
      orderBy: { payment_time: sort },
      include: {
        patient: {
          include: {
            user: true,
          }
        },
        record: {
          include: {
            invoiceItems: true,
          }
        }
      }
    });

    const totalCount = await prisma.payment.count({
      where: {
        ...filters,
        patient: name ? {
          user: {
            full_name: {
              contains: name,
              // mode: 'insensitive',
            }
          }
        } : undefined,
      }
    });

    const data = payments.map(p => ({
      id: p.id,
      record_id: p.record?.id,
      patient_name: p.patient.user.full_name,
      examined_at: p.record?.examined_at,
      service_count: p.record?.invoiceItems.length || 0,
      total_amount: Number(p.amount),
      status: p.status,
      payment_time: p.payment_time,
      //   method: p.method,
    }));

    return {
      payments: data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: +page,
    };
  };

  updatePaymentStatus = async (id, status) => {
    if (id == null || !status) {
      throw new Error("ID và trạng thái không được để trống");
    }
    console.log(id, status)
    const payment = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status },
    });
    return payment;
  }

  updatePaymentMedicineStatus = async (id, status) => {
    if (id == null || !status) {
      throw new Error("ID và trạng thái không được để trống");
    }
  
    const paymentData = await prisma.payment.findFirst({
      where: { record_id: Number(id) }
    });
  //  console.log(paymentData)
    if (!paymentData) throw new Error("Không tìm thấy payment");  
    console.log(paymentData)
    const payment = await prisma.payment.update({
      where: { id: paymentData.id },
      data: { 
        status : status,
        method:"bank_transfer",
        note : "thank toán tiền thuốc chữa trị"
      }
    });
    
    return payment;
  }

  getPaymentByRecordId = async (id) => {
    const payment = await prisma.payment.findFirst({
      where:{record_id : Number(id)}
    })
    return payment;
  }

  getPendingPayments = async () => {
    const payments = await prisma.payment.findMany({
      where: { status: 'pending' },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        record: {
          include: {
            invoiceItems: true,
          }
        },
      },
    });
    // console.log(payments)

    const data = payments.map(p => ({
      id: p.id, // This is payment id
      record_id: p.record?.id,
      patient_name: p.patient.user.full_name,
      examined_at: p.record?.examined_at,
      service_count: p.record?.invoiceItems.length || 0,
      total_amount: Number(p.amount),
      status: p.status,
      payment_time: p.payment_time,
    }));
    // console.log(">>>>>>>>data", data)
    return data
  };

  webhook = async (data) => {
    const {
      subAccount,
      transactionDate,
      transferAmount,
      description,
      referenceCode,
    } = data;
    //console.log("data", data)
    const match = description.match(/Thanh Toan (.+?)(\.|$)/i);
    const patientName = match ? match[1].trim() : null;


    // TODO: Tìm invoice bằng patient name hoặc subAccount
    const invoice = await prisma.payment.findFirst({
      where: {
        patient: {
          user: {
            full_name: {
              contains: patientName,
            },
          },
        },
        amount: transferAmount,
        status: "pending",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!invoice) {
      console.log("Không tìm thấy hóa đơn phù hợp");
      return res.status(200).json({ message: "No matching invoice" });
    }

    // Cập nhật trạng thái đã thanh toán
    await prisma.payment.update({
      where: { id: invoice.id },
      data: {
        status: "paid",
        // paid_at: new Date(transactionDate),
        // payment_reference: referenceCode,
      },
    });
    const io = getIO();
    if (io) {
      // gửi đến tất cả client tham gia phòng payment event payment:statusChanged
      io.to(`payment`).emit("payment:statusChanged", {
        invoice: invoice,
      });
    }

  }



}

module.exports = new PaymentService();
