const { OK } = require("../core/success.response");
const examinationRecordService = require("../services/examinationRecord.service");

class ExaminationRecordController {
    static async create(req, res) {
        const record = await examinationRecordService.create(req.body);
        return new OK({ message: "Tạo hồ sơ khám thành công", metadata: record }).send(res);
    }

    static async update(req, res) {
        const { id } = req.params;
        const record = await examinationRecordService.update(id, req.body);
        return new OK({ message: "Cập nhật hồ sơ khám thành công", metadata: record }).send(res);
    }

    static async getById(req, res) {
        const { id } = req.params;
        const record = await examinationRecordService.getById(id);
        return new OK({ message: "Lấy hồ sơ khám thành công", metadata: record }).send(res);
    }
    static async getByAppointmentId(req, res) {
        const { appointmentId } = req.params;
        const record = await examinationRecordService.getByAppointmentId(appointmentId);
        return new OK({ message: "Lấy hồ sơ khám theo lịch hẹn thành công", metadata: record }).send(res);
    }

    static async getAll(req, res) {
        const records = await examinationRecordService.getAll(req.query);
        return new OK({ message: "Lấy danh sách hồ sơ khám thành công", metadata: records }).send(res);
    }
}

module.exports = ExaminationRecordController; 