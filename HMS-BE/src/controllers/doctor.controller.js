const { CREATED, OK } = require("../core/success.response");
const DoctorService = require("../services/doctor.service");

class DoctorController {

    createDoctor = async (req, res) => {
        const result = await DoctorService.createDoctor(req.body);
        return new CREATED({
            message: "Tạo bác sĩ thành công",
            metadata: result,
        }).send(res);
    }

    getDoctors = async (req, res) => {
        const result = await DoctorService.getDoctors(req.body);
        return new OK({
            message: "Lấy danh sách bác sĩ thành công",
            metadata: result,
        }).send(res);
    }

    getAllDoctors = async (req, res) => {
        const result = await DoctorService.findAllDoctor();
        return new OK({
            message: "Lấy danh sách bác sĩ thành công",
            metadata: result,
        }).send(res);
    }

    updateDoctor = async (req, res) => {
        const result = await DoctorService.updateDoctor(req.body);
        return new OK({
            message: "Cập nhật bác sĩ thành công",
            metadata: result,
        }).send(res);
    }

    changeActive = async (req, res) => {
        const result = await DoctorService.changeActive(req.body);
        return new OK({
            message: "Thay đổi trạng thái bác sĩ thành công",
            metadata: result,
        }).send(res);
    }

    updatePassword = async (req, res) => {
        const result = await DoctorService.updatePassword(req.body);
        return new OK({
            message: "Cập nhật mật khẩu bác sĩ thành công",
        }).send(res);
    }
}

module.exports = new DoctorController();
