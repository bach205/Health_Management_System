const { CREATED, OK } = require("../core/success.response");
const AuthService = require("../services/auth.service");

class AuthController {
  async register(req, res) {
    const result = await AuthService.register(req.body);
    return new CREATED({
      message: "Register successfully",
      metadata: result,
    }).send(res);
  }

  async login(req, res) {
    const result = await AuthService.login(req.body);
    return new OK({
      message: "Login successfully",
      metadata: result,
    }).send(res);
  }

  async updatePatientFullInfo(req, res) {
    const { userId, updateData } = req.body;
    const result = await AuthService.updatePatientFullInfo(userId, updateData);
    return new OK({
      message: "Update patient info successfully",
      metadata: result,
    }).send(res);
  }

  async logout(req, res) {
    const result = await AuthService.logout(req.body);
    return new OK({
      message: result.message,
      metadata: {},
    }).send(res);
  }
}

module.exports = new AuthController();
