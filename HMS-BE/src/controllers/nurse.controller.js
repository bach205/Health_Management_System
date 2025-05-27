const { CREATED, OK } = require("../core/success.response");
const NurseService = require("../services/nurse.service");

class NurseController {
    async register(req, res) {
        const result = await AuthService.register(req.body);
        return new CREATED({
            message: "Register successfully",
            metadata: result,
        }).send(res);
    }

    createNurse = async (req, res) => {
        const result = await NurseService.createNurse(req.body);
        return new CREATED({
            message: "Create nurse successfully",
            metadata: result,
        }).send(res);
    }
}

module.exports = new NurseController();
