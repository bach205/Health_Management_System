const { OK } = require("../core/success.response");
const ExaminationOrderService = require("../services/examinationOrder.service");

class ExaminationOrderController {
    static async create(req, res) {
        const order = await ExaminationOrderService.create(req.body);
        return new OK({ message: "Tạo yêu cầu chuyển phòng thành công", metadata: order }).send(res);
    }

    static async getById(req, res) {
        const { id } = req.params;
        const order = await ExaminationOrderService.getById(id);
        return new OK({ message: "Lấy yêu cầu chuyển phòng thành công", metadata: order }).send(res);
    }

    static async getAll(req, res) {
        const orders = await ExaminationOrderService.getAll(req.query);
        return new OK({ message: "Lấy danh sách yêu cầu chuyển phòng thành công", metadata: orders }).send(res);
    }
}

module.exports = ExaminationOrderController; 