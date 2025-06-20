const express = require("express");
const AuthController = require("../controllers/auth.controller");
const asyncHandler = require("../helper/asyncHandler");
const {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
  facebookLoginSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const authController = require("../controllers/auth.controller");
const authRouter = express.Router();
const { authenticate } = require("../middlewares/auth");
const checkUserStatus = require("../middlewares/checkUserStatus");

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
  checkUserStatus(),
  asyncHandler(AuthController.updatePatientFullInfo),
  authController.updatePatientFullInfo
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

// Ví dụ check authen bên trong router
// authRouter.get("/users", authenticateToken, authorizeRoles("admin"), asyncHandler(AuthController.getUsers));

module.exports = authRouter;
