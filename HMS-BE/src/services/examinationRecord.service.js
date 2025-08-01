const prisma = require("../config/prisma");
const { getIO } = require("../config/socket");
const paymentService = require("./payment.service");
const prescriptionItemService = require("./prescriptionItem.service");

class ExaminationRecordService {
    static async createIfNotExists(patient_id, clinic_id, doctor_id) {
        let record = await prisma.examinationRecord.findFirst({
            where: { patient_id, result: null },
        });
        if (!record) {
            record = await prisma.examinationRecord.create({
                // them 2 truong clinic_id, doctor_id
                data: {
                    patient_id,
                    clinic_id,
                    doctor_id,
                }
            });
        }
        return record;
    }

    // edited after removed examinationDetail service
    static async create(data) {
        const { patient_id, clinic_id, doctor_id, quantity, appointment_id, result, note, prescription_items = [] } = data;
        console.log(data)
        if (!result.trim()) throw new Error("Không được để trống kết quả khám");


        const queue = await prisma.queue.findFirst({
            where: { patient_id, status: "in_progress" },
        });
        if (!queue) throw new Error("ERRROROROROROR");

        try {
            await prisma.queue.update({
                where: { id: queue.id },
                data: { status: "done" },
            });
        } catch (error) {
            console.log(error);
        }


        const record = await prisma.examinationRecord.create({
            data: {
                patient: {
                    connect: { id: patient_id }
                },
                clinic: {
                    connect: { id: clinic_id }
                },
                doctor: {
                    connect: { user_id: doctor_id }
                },
                appointment: appointment_id ? { connect: { id: appointment_id } } : undefined,
                quantity,
                result,
                note,
                examined_at: new Date(),
            },
        });

        console.log("record: ", record);

        try {
            await prisma.appointment.update({
                where: { id: appointment_id },
                data: { status: "completed" },
            });
        } catch (error) {
            console.log(error);
        }

        // Gọi tạo nhiều thuốc nếu có
        try {
            if (prescription_items.length > 0) {
                await prescriptionItemService.createMany(record.id, prescription_items);
            }

        } catch (error) {
            console.log(error);
        }
        let doctor_ids = [];
        doctor_ids.push(doctor_id);
        // kiểm tra xem bệnh nhân có được chuyển phòng không, giá sẽ cộng dồn
        const orders = await prisma.examinationOrder.findMany({
            where: { appointment_id },
        });
        console.log("orders", orders)
        if (orders) {
            doctor_ids = [...orders.map(item => item.doctor_id), doctor_id];
        }
        console.log("doctor_id", doctor_id)
        console.log("doctor_ids", doctor_ids)

        try {
            await paymentService.createInvoiceAndPaymentAfterExamination(record, appointment_id, doctor_ids, patient_id);
        } catch (error) {
            console.error("Error creating invoice and payment:", error);
            throw new Error("Lỗi khi tạo hóa đơn và thanh toán: " + error.message);
        }

        const io = getIO();
        io.to(`clinic_${queue.clinic_id}`).emit("queue:statusChanged", {
            queue: { ...queue, status: "done" },
            clinicId: queue.clinic_id,
        });


        return record
    }

    static async getByAppointmentId(appointmentId) {
        if (!appointmentId) throw new Error("Appointment ID phải tồn tại");

        const record = await prisma.examinationRecord.findFirst({
            where: { appointment_id: Number(appointmentId) },
            include: {
                clinic: true,
                doctor: {
                    include: {
                        user: true,
                    },
                },
                patient: {
                    include: {
                        user: true,
                    },
                },
                prescriptionItems: {
                    include: {
                        medicine: true,
                    },
                },
                payments: true,
            }

        });
        console.log(record)
        return record;
    }

    static async update(id, data) {
        return prisma.examinationRecord.update({
            where: { id: Number(id) },
            data,
        });
    }

    static async getById(id) {
        return prisma.examinationRecord.findUnique({
            where: { id: Number(id) },
            include: {
                patient: true,
                // primaryDoctor: true,
                // createdByUser: true,
                // prescriptions: true,
                // invoiceItems: true,
                // queues: true,
                payments: true,
            },
        });
    }

    static async getAll(query = {}) {
        return prisma.examinationRecord.findMany({
            where: query,
            include: {
                patient: true,
                primaryDoctor: true,
            },
            orderBy: { created_at: "desc" },
        });
    }

    // Lấy lịch sử khám của bệnh nhân
    static async getPatientExaminationHistory(patientId) {
        return prisma.examinationRecord.findMany({
            where: { patient_id: Number(patientId) },
            include: {
                clinic: true,
                doctor: {
                    include: {
                        user: true,
                    },
                },
                prescriptionItems: {
                    include: {
                        medicine: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });
    }
}

module.exports = ExaminationRecordService;