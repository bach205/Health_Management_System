const prisma = require("../config/prisma");

class ExaminationRecordService {
    static async create(data) {
        try {
            const { patient_id } = data;
            const queue = await prisma.queue.findFirst({
                where: {
                    patient_id: patient_id,
                    status: "in_progress",
                },
            });

            if (!queue) {
                throw new Error("Bệnh nhân không có lịch khám");
            }



            await prisma.queue.update({
                where: { id: queue.id },
                data: {
                    status: "done",
                },
            });

            return await prisma.examinationRecord.create({ data });
        } catch (error) {
            throw new Error(error);
        }
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
                examinationDetails: true,
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