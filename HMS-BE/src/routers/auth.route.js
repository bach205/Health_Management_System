const express = require("express");
const AuthController = require("../controllers/auth.controller");
const asyncHandler = require("../helper/asyncHandler");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const validate = require("../middlewares/validate");

const authRouter = express.Router();

authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(AuthController.login));

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(AuthController.register));

// Ví dụ check authen bên trong router
// authRouter.get("/users", authenticateToken, authorizeRoles("admin"), asyncHandler(AuthController.getUsers));

module.exports = authRouter;
