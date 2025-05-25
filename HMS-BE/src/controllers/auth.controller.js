const { CREATED, OK } = require("../core/success.response");
const AuthService = require("../services/auth.service");

class AuthController {
    async register(req, res){
        const result = await AuthService.register(req.body);
        return new CREATED({
            message: "Register successfully",
            metadata: result
        }).send(res)
    }

    async login(req, res){
        const result = await AuthService.login(req.body);
        return new OK({
            message: "Login successfully",
            metadata: result
        }).send(res)
    }
}

module.exports =  new AuthController();