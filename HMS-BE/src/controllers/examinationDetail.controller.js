const { OK } = require("../core/success.response");
const ExaminationDetailService = require("../services/examinationDetail.service");

class ExaminationDetailController {
    static async create(req, res) {
        const detail = await ExaminationDetailService.create(req.body);
        return new OK({ message: "Tạo kết quả khám thành công", metadata: detail }).send(res);
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
}

module.exports = ExaminationDetailController; 