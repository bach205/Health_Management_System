const { CREATED, OK } = require("../core/success.response");
const NurseService = require("../services/nurse.service");
class NurseController {
    getAllNurse = async (req, res) => {
        try {
            const result = await NurseService.findAllNurse(req.query);
            if (!result) return res.status(400).json({
                message: "there is something error when create nurse"
            })
            return new OK({
                message: "Get all nurse successfully",
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
                message: "there is something error when create nurse"
            })
            return new CREATED({
                message: "Create nurse successfully",
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
                message: "Update nurse successfully",
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
                message: result.is_active ? "Unban nurse successfully" : "Ban nurse successfully",
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
}

module.exports = new NurseController();
