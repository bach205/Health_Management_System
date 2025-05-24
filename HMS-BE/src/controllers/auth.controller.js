const { CREATED, OK } = require("../core/success.response");
const AuthService = require("../services/auth.service");

class AuthController {
    static async register(req, res) {
        return new CREATED({
            message: "Register successfully",
            metadata: await AuthService.register(req.body)
        }).send(res)
    }

    static async login(req, res) {
        return new OK({
            message: "Login successfully",
            metadata: await AuthService.login(req.body)
        }).send(res)
    }
}

module.exports = AuthController;