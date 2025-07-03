const { CREATED, OK } = require("../core/success.response");
const AuthService = require("../services/auth.service");

class AuthController {
  async register(req, res) {
    try {
      console.log("req.body: ", req.body);
      const result = await AuthService.register(req.body);
      return new CREATED({
        message: "Đăng ký thành công",
        metadata: {
          user: result.user,
          patient: result.patient,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đăng ký thất bại",
        error: error.name,
      });
    }
  }

  async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      return new OK({
        message: "Đăng nhập thành công",
        metadata: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đăng nhập thất bại",
        error: error.name,
      });
    }
  }

  async updatePatientFullInfo(req, res) {
    try {
      const { userId, updateData } = req.body;
      const result = await AuthService.updatePatientInfo(userId, updateData);
      return new OK({
        message: "Cập nhật thông tin thành công",
        metadata: result,
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Cập nhật thông tin thất bại",
        error: error.name,
      });
    }
  }

  async logout(req, res) {
    try {
      const result = await AuthService.logout(req.body);
      return new OK({
        message: "Đăng xuất thành công",
        metadata: {},
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đăng xuất thất bại",
        error: error.name,
      });
    }
  }

  async forgetPassword(req, res) {
    try {
      const result = await AuthService.forgetPassword(req.body.email);
      return new OK({
        message: "Đã gửi link đặt lại mật khẩu vào email của bạn",

        metadata:
          process.env.NODE_ENV === "development"
            ?
            {
              resetToken: result.resetToken,
            }
            : {},
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Không thể gửi email đặt lại mật khẩu",
        error: error.name,
      });
    }
  }

  async resetPassword(req, res) {
    console.log("Reset password request received:", req.body);

    try {
      const { token, oldPassword, newPassword, confirmPassword } = req.body;
      const result = await AuthService.resetPassword(
        token,
        oldPassword,
        newPassword,
        confirmPassword
      );
      return new OK({
        message: "Đổi mật khẩu thành công",
        metadata: {},
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đổi mật khẩu thất bại",
        error: error.name,
      });
    }
  }

  async googleLogin(req, res) {
    try {
      const result = await AuthService.googleLogin(req.body);
      return new OK({
        message: "Đăng nhập bằng Google thành công",
        metadata: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đăng nhập bằng Google thất bại",
        error: error.name,
      });
    }
  }

  async facebookLogin(req, res) {
    try {
      const result = await AuthService.facebookLogin(req.body);
      return new OK({
        message: "Đăng nhập bằng Facebook thành công",
        metadata: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đăng nhập bằng Facebook thất bại",
        error: error.name,
      });
    }
  }

  async getUserInfor(req, res) {
    try {
      // req.user đã được middleware authenticate gán khi xác thực token
      const userId = req.user.id;
      const user = await AuthService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Lấy thông tin người dùng thất bại",
        error: error.name,
      });
    }
  }

  async updateAvatar(req, res) {
    const result = await AuthService.updateAvatar(req.body);
    return new OK({
      message: "Cập nhật avatar thành công",
      metadata: result,
    }).send(res);
  }

  async loginWithPhone(req, res) {
    try {
      const result = await AuthService.loginWithPhone(req.body);
      return new OK({
        message: "Đăng nhập thành công",
        metadata: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đăng nhập thất bại",
        error: error.name,
      });
    }
  }

  async registerWithPhone(req, res) {
    try {
      const result = await AuthService.registerWithPhone(req.body);
      return new CREATED({
        message: "Đăng ký thành công",
        metadata: {
          user: result.user,
          patient: result.patient,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Đăng ký thất bại",
        error: error.name,
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
          error: "REFRESH_TOKEN_REQUIRED"
        });
      }

      const result = await AuthService.refreshToken(refreshToken);
      return new OK({
        message: "Token refreshed successfully",
        metadata: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      }).send(res);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Refresh token failed",
        error: error.name,
      });
    }
  }

  async checkPasswordMatch(req, res) {
    try {
      const { newPassword, confirmPassword, token } = req.body;
      //console.log(req.body);
      // if(!token) {
      //   return res.status(401).json('No token provided');
      // }
      const result = await AuthService.checkPasswordMatch(newPassword, confirmPassword, token);

      return res.json(result);
    } catch (error) {
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || "Check password match failed",
      });
    }
  }
}

module.exports = new AuthController();
