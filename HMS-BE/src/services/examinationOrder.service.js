const prisma = require("../config/prisma");
const { getIO } = require("../config/socket.js");
const DoctorService = require("./doctor.service");

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

        // 2. Lấy danh sách bác sĩ rảnh và slot gần nhất ở phòng tiếp theo
        const availableDoctors = await DoctorService.getAvailableDoctorsWithNearestSlot(to_clinic_id);
        // Chọn bác sĩ có slot gần nhất (ưu tiên slot sớm nhất)
        let nextDoctor = null;
        let nearestSlot = null;
        if (availableDoctors.length > 0) {
            // Lọc ra những bác sĩ thực sự có slot
            const doctorsWithSlot = availableDoctors.filter(d => d.nearestSlot);
            if (doctorsWithSlot.length > 0) {
                // Sắp xếp theo slot gần nhất
                doctorsWithSlot.sort((a, b) => {
                    const aTime = new Date(a.nearestSlot.slot_date).getTime() + (a.nearestSlot.start_time ? new Date(`1970-01-01T${a.nearestSlot.start_time}`).getTime() : 0);
                    const bTime = new Date(b.nearestSlot.slot_date).getTime() + (b.nearestSlot.start_time ? new Date(`1970-01-01T${b.nearestSlot.start_time}`).getTime() : 0);
                    return aTime - bTime;
                });
                nextDoctor = doctorsWithSlot[0];
                nearestSlot = doctorsWithSlot[0].nearestSlot;
            }
        }

        // 3. Emit socket event để thông báo chuyển phòng
        const io = getIO();
        if (io) {
            io.to(`clinic_${to_clinic_id}`).emit("examination:transfer", {
                order,
                nextDoctor,
                nearestSlot,
                clinicId: to_clinic_id
            });
        }

        return { order, nextDoctor, nearestSlot };
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