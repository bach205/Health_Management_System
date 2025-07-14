const express = require("express");
const AuthController = require("../controllers/auth.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  registerSchema,
  loginSchema,
  checkPasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
  facebookLoginSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const authController = require("../controllers/auth.controller");
const authRouter = express.Router();
const { authenticate, authorize } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");
const PatientService = require("../services/patient.service");

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(AuthController.login),
  authController.login
);

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  asyncHandler(AuthController.register),
  authController.register
);

authRouter.put(
  "/update-patient",
  authenticate,
  authorize("patient"),
  checkUserStatus(),
  asyncHandler(AuthController.updatePatientInfo),
  PatientService.updatePatient
);

authRouter.post(
  "/logout",
  asyncHandler(AuthController.logout),
  authController.logout
);

authRouter.post(
  "/forget-password",
  validate({ body: forgetPasswordSchema }),
  asyncHandler(AuthController.forgetPassword),
  authController.forgetPassword
);

authRouter.post(
  "/reset-password",
  authenticate,
  validate({ body: resetPasswordSchema }),
  asyncHandler(AuthController.resetPassword),
  authController.resetPassword
);

authRouter.post(
  "/google-login",
  validate({ body: googleLoginSchema }),
  asyncHandler(AuthController.googleLogin),
  authController.googleLogin
);

authRouter.post(
  "/facebook-login",
  validate({ body: facebookLoginSchema }),
  asyncHandler(AuthController.facebookLogin),
  authController.facebookLogin
);

authRouter.get(
  "/me",
  authenticate,
  authorize("patient", "admin" , "doctor", "nurse"),
  checkUserStatus(),
  asyncHandler(AuthController.getUserInfor),
  authController.getUserInfor
);

authRouter.post(
  "/update-avatar",
  authenticate,
  checkUserStatus(),
  asyncHandler(AuthController.updateAvatar),
  authController.updateAvatar
);

authRouter.post(
  "/login-phone",
  asyncHandler(AuthController.loginWithPhone),
  authController.loginWithPhone
);

authRouter.post(
  "/register-phone",
  asyncHandler(AuthController.registerWithPhone),
  authController.registerWithPhone
);

authRouter.post(
  "/refresh-token",
  asyncHandler(AuthController.refreshToken),
  authController.refreshToken
);

// API kiểm tra mật khẩu mới và xác nhận mật khẩu mới có trùng nhau không (dùng controller)
authRouter.post(
  '/check-password-match',
  validate({ body: checkPasswordSchema }),
  asyncHandler(AuthController.checkPasswordMatch),
  AuthController.checkPasswordMatch
);

// Ví dụ check authen bên trong router
// authRouter.get("/users", authenticateToken, authorizeRoles("admin"), asyncHandler(AuthController.getUsers));

module.exports = authRouter;
