const prisma = require("../config/prisma");
const { getIO } = require("../config/socket");
const prescriptionItemService = require("./prescriptionItem.service");

class ExaminationRecordService {
    static async createIfNotExists(patient_id, clinic_id, doctor_id) {
        let record = await prisma.examinationRecord.findFirst({
            where: { patient_id, final_diagnosis: null },
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
        const { patient_id, clinic_id, doctor_id, result, note, prescription_items = [] } = data;

        if (!result.trim()) throw new Error("Không được để trống kết quả khám");


        const queue = await prisma.queue.findFirst({
            where: { patient_id, status: "in_progress" },
        });
        if (!queue) throw new Error("Không có queue đang khám");

        await prisma.queue.update({
            where: { id: queue.id },
            data: { status: "done" },
        });

        const io = getIO();
        io.to(`clinic_${queue.clinic_id}`).emit("queue:statusChanged", {
            queue: { ...queue, status: "done" },
            clinicId: queue.clinic_id,
        });

        const record = await prisma.examinationRecord.create({
            data: {
                patient_id,
                clinic_id,
                doctor_id,
                result,
                note,
                examined_at: new Date(), // hoặc từ client
                final_diagnosis,
            },
        });

        // Gọi tạo nhiều thuốc nếu có
        if (prescription_items.length > 0) {
            await prescriptionItemService.createMany(record.id, prescription_items);
        }
        return record
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
                primaryDoctor: true,
                createdByUser: true,
                prescriptions: true,
                invoiceItems: true,
                queues: true,
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
}

module.exports = ExaminationRecordService;