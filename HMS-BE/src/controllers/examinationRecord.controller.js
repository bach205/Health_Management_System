const { OK } = require("../core/success.response");
const ExaminationRecordService = require("../services/examinationRecord.service");

class ExaminationRecordController {
    static async create(req, res) {
        const record = await ExaminationRecordService.create(req.body);
        return new OK({ message: "Tạo hồ sơ khám thành công", metadata: record }).send(res);
    }

    static async update(req, res) {
        const { id } = req.params;
        const record = await ExaminationRecordService.update(id, req.body);
        return new OK({ message: "Cập nhật hồ sơ khám thành công", metadata: record }).send(res);
    }

    static async getById(req, res) {
        const { id } = req.params;
        const record = await ExaminationRecordService.getById(id);
        return new OK({ message: "Lấy hồ sơ khám thành công", metadata: record }).send(res);
    }

    static async getAll(req, res) {
        const records = await ExaminationRecordService.getAll(req.query);
        return new OK({ message: "Lấy danh sách hồ sơ khám thành công", metadata: records }).send(res);
    }
}

module.exports = ExaminationRecordController; 