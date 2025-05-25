const express = require("express");
const AuthController = require("../controllers/auth.controller");
const asyncHandler = require("../helper/asyncHandler");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const authController = require("../controllers/auth.controller");
const authRouter = express.Router();

authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(AuthController.login), authController.login);

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(AuthController.register), authController.register);

// Ví dụ check authen bên trong router
// authRouter.get("/users", authenticateToken, authorizeRoles("admin"), asyncHandler(AuthController.getUsers));

module.exports = authRouter;
