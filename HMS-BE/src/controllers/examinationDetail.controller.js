const { OK } = require("../core/success.response");
const ExaminationDetailService = require("../services/examinationDetail.service");

class ExaminationDetailController {
    // Tạo kết quả khám, đồng thời chuyển phòng nếu có chỉ định
    static async create(req, res, next) {
        try {
            const detail = await ExaminationDetailService.create(req.body);
            return new OK({ message: "Tạo kết quả khám thành công", metadata: detail }).send(res);
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const detail = await ExaminationDetailService.update(id, req.body);
        return new OK({ message: "Cập nhật kết quả khám thành công", metadata: detail }).send(res);
    }

    static async getById(req, res) {
        const { id } = req.params;
        const detail = await ExaminationDetailService.getById(id);
        return new OK({ message: "Lấy kết quả khám thành công", metadata: detail }).send(res);
    }

    static async getAll(req, res) {
        const details = await ExaminationDetailService.getAll(req.query);
        return new OK({ message: "Lấy danh sách kết quả khám thành công", metadata: details }).send(res);
    }

    static async getDoctorsInClinic(req, res) {
        const { clinicId } = req.params;
        const doctors = await ExaminationDetailService.getDoctorsInClinic(clinicId);
        return new OK({ message: "Lấy danh sách bác sĩ trong phòng khám thành công", metadata: doctors }).send(res);
    }

    static async getDoctorAvailableSlots(req, res) {
        const { doctorId } = req.params;
        const { slot_date } = req.query;
        const slots = await ExaminationDetailService.getDoctorAvailableSlots(doctorId, slot_date);
        return new OK({ message: "Lấy danh sách ca khám có thể chọn thành công", metadata: slots }).send(res);
    }
}

module.exports = ExaminationDetailController; 