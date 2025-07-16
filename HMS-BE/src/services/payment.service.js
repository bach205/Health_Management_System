const prisma = require("../config/prisma");

class PaymentService {

    async createInvoiceAndPaymentAfterExamination(record, appointment_id, doctor_id, patient_id) {
        // 1. Lấy giá bác sĩ
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

        // 3.2. Thêm từng dịch vụ từ ExaminationOrder
        for (const order of orders) {
            invoiceItemsData.push({
                record_id: record.id,
                description: `Chi phí dịch vụ từ phòng khám ${order.from_clinic_id} đến ${order.to_clinic_id}`,
                amount: order.total_cost,
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
    }

    getAllPayments = async (query) => {
        const { page = 1, limit = 10, ...filters } = query;
        const skip = (page - 1) * limit;

        const payments = await prisma.payment.findMany({
            where: filters,
            skip,
            take: limit,
            orderBy: { payment_time: "desc" },
        });

        const totalCount = await prisma.payment.count({ where: filters });

        return {
            payments,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        };
    };

    updatePaymentStatus = async (id, status) => {
        const payment = await prisma.payment.update({
            where: { id },
            data: { status },
        });
        return payment;
    }

}

module.exports = new PaymentService();
