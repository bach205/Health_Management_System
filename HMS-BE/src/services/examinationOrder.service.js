const prisma = require("../config/prisma");
const { getIO } = require("../config/socket.js");

class ExaminationOrderService {
    /**
     * Tạo yêu cầu chuyển phòng khám
     * @param {Object} data - Thông tin chuyển phòng
     * @returns {Promise<Object>} Thông tin yêu cầu đã tạo
     */
    static async create(data) {
        const { doctor_id, patient_id, from_clinic_id, to_clinic_id, total_cost } = data;

        // 1. Tạo order chuyển phòng
        const order = await prisma.examinationOrder.create({
            data,
            include: {
                doctor: true,
                patient: true,
                fromClinic: true,
                toClinic: true,
            }
        });

        // 2. Lấy thông tin bác sĩ phòng tiếp theo (lấy bác sĩ đầu tiên có lịch ở phòng đó)
        const workSchedule = await prisma.workSchedule.findFirst({
            where: {
                clinic_id: to_clinic_id,
            },
            include: {
                user: true,
            },
        });
        const nextDoctor = workSchedule ? workSchedule.user : null;

        // 3. Emit socket event để thông báo chuyển phòng
        const io = getIO();
        if (io) {
            io.to(`clinic_${to_clinic_id}`).emit("examination:transfer", {
                order,
                nextDoctor,
                clinicId: to_clinic_id
            });
        }

        return { order, nextDoctor };
    }

    /**
     * Lấy thông tin chi tiết yêu cầu chuyển phòng
     * @param {number} id - ID yêu cầu
     * @returns {Promise<Object>} Thông tin chi tiết
     */
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

    /**
     * Lấy danh sách yêu cầu chuyển phòng
     * @param {Object} query - Thông tin tìm kiếm
     * @returns {Promise<Array>} Danh sách yêu cầu
     */
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

    static async getPatientExaminationOrder(id) {
        return prisma.examinationOrder.findMany({
            where: { patient_id: Number(id) },
            include: {
                doctor: true,
                patient: true,
                fromClinic: true,
                toClinic: true,
            },
        });
    }
}

module.exports = ExaminationOrderService; 