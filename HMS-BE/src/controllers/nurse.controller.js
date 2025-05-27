const { CREATED, OK } = require("../core/success.response");
const NurseService = require("../services/nurse.service");
class NurseController {


    createNurse = async (req, res) => {
        try {
            const result = await NurseService.createNurse(req.body);
            return new CREATED({
                message: "Create nurse successfully",
                metadata: result,
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
}

module.exports = new NurseController();
