const prisma = require("../config/prisma");

class ExaminationOrderService {
    static async create(data) {
        return prisma.examinationOrder.create({ data });
    }

    static async getById(id) {
        return prisma.examinationOrder.findUnique({
            where: { id: Number(id) },
            include: {
                doctor: true,
                patient: true,
                fromClinic: true,
                toClinic: true,
            },
        });
    }

    static async getAll(query = {}) {
        return prisma.examinationOrder.findMany({
            where: query,
            include: {
                doctor: true,
                patient: true,
                fromClinic: true,
                toClinic: true,
            },
            orderBy: { created_at: "desc" },
        });
    }
}

module.exports = ExaminationOrderService; 