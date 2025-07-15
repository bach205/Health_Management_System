const { CREATED, OK } = require("../core/success.response");
const NurseService = require("../services/nurse.service");
class NurseController {
    getAllNurse = async (req, res) => {
        try {

            const result = await NurseService.findAllNurse(req.query);
            if (!result) return res.status(400).json({
                message: "Có lỗi trong quá trình lấy tất cả tài khoản, vui lòng thử lại!"
            })
            return new OK({
                message: "Lấy tất cả tài khoản thành công",
                metadata: result
            }).send(res);
        } catch (error) {
            return res.status(error.status).json({
                message: error.message,
            })
        }
    }

    createNurse = async (req, res) => {
        try {
            const result = await NurseService.createNurse(req.body);
            if (!result) return res.status(400).json({
                message: "Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại!"
            })
            return new CREATED({
                message: "Tạo tài khoản thành công",
            }).send(res);
        } catch (error) {
            return res.status(error.status).json({
                message: error.message,
            })
        }
    }
    updateNurse = async (req, res) => {
        try {
            const result = await NurseService.updateNurse(req.params.id, req.body);
            return new OK({
                message: "Cập nhật tài khoản thành công",
                metadata: result,
            }).send(res);
        } catch (error) {
            return res.status(error.status).json({
                message: error.message,
            })
        }
    }
    banNurse = async (req, res) => {
        try {
            const result = await NurseService.banNurse(req.params.id);
            return new OK({
                message: result.is_active ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công",
                metadata: result,
            }).send(res);
        } catch (error) {
            return res.status(error.status).json({
                message: error.message,
            })
        }
    }

    resetPassword = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await NurseService.resetPassword(id);
            res.status(result.status).json(result.data);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    deleteNurse = async (req, res) => {
        try {
            const result = await NurseService.deleteNurse(req.params.id);
            return res.status(200).json({
                message: "Xóa tài khoản thành công",
                metadata: result
            });
        } catch (error) {
            return res.status(error.status || 400).json({
                message: error.message
            });
        }
    }
    createNursesFromCSV = async (req, res) => {
        try {
            const result = await NurseService.createNursesFromCSV(req.file);
            return new CREATED({
                message: "Tạo tài khoản từ file CSV thành công",
                metadata: result,
            }).send(res);
        } catch (error) {
            return res.status(error.status || 400).json({
                message: error.message,
            });
        }
    }
}

module.exports = new NurseController();
