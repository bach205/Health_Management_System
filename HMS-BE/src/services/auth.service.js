const { BadRequestError } = require("../core/error.response");
const {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  facebookLoginSchema,
} = require("../validators/auth.validator");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helper/jwt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

class AuthService {
  async register(userData) {
    // Validate input
    const { error } = registerSchema.validate(userData);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestError("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    // Create user and patient in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          phone: userData.phone,
          role: "patient", // Sử dụng string literal
          sso_provider: "local",
        },
      });

      // Create patient
      const patient = await prisma.patient.create({
        data: {
          identity_number: userData.identity_number || null,
        },
      });

      return { user, patient };
    });

    // Generate tokens
    const tokens = generateToken(result.user);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.full_name,
        role: result.user.role,
      },
      patient: {
        id: result.patient.id,
      },
      ...tokens,
    };
  }

  async login({ email, password }) {
    // Validate input
    const { error } = loginSchema.validate({ email, password });
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError("Invalid credentials");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new BadRequestError("Account is deactivated");
    }

    // Generate tokens
    const tokens = generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async logout({ email }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestError("User not found");
    }
    return { message: "Logout successful" };
  }

  async updatePatient(userId, identityNumber) {
    // Kiểm tra user có tồn tại và có role patient không
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestError("User not found");
    }
    if (user.role !== "patient") {
      throw new BadRequestError("User is not a patient");
    }

    // Tìm patient dựa trên userId (giả sử có liên kết user_id trong model Patient)
    const patient = await prisma.patient.findFirst({
      where: { user_id: userId },
    });
    if (!patient) {
      throw new BadRequestError("Patient not found");
    }

    // Cập nhật identity_number
    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: { identity_number: identityNumber },
    });
    return updatedPatient;
  }

  async updatePatientInfo(userId, updateData) {
    // Kiểm tra user có tồn tại và có role patient không
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestError("User not found");
    }
    if (user.role !== "patient") {
      throw new BadRequestError("User is not a patient");
    }

    // Cập nhật thông tin user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        full_name: updateData.full_name,
        email: updateData.email,
        address: updateData.address,
        phone: updateData.phone,
        gender: updateData.gender,
      },
    });
    return updatedUser;
  }

  async updatePatientFullInfo(userId, updateData) {
    // Kiểm tra user có tồn tại và có role patient không
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestError("User not found");
    }
    if (user.role !== "patient") {
      throw new BadRequestError("User is not a patient");
    }

    // Tìm patient dựa trên userId (giả sử có liên kết user_id trong model Patient)
    const patient = await prisma.patient.findFirst({
      where: { id: userId },
    });
    if (!patient) {
      throw new BadRequestError("Patient not found");
    }

    // Cập nhật thông tin user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        full_name: updateData.full_name,
        email: updateData.email,
        address: updateData.address,
        phone: updateData.phone,
        gender: updateData.gender,
      },
    });

    // Cập nhật identity_number của patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patient.id },
      data: { identity_number: updateData.identity_number },
    });

    return { user: updatedUser, patient: updatedPatient };
  }

  async forgetPassword(email) {
    // Kiểm tra user có tồn tại không
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestError("User not found");
    }

    // Tạo reset token
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Tạo transporter với cấu hình email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587, // Port mặc định cho TLS
      secure: false, // false cho TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Tạo nội dung email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset Your Password - HMS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>Hello ${user.full_name || "there"},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #3498db; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            This link will expire in 1 hour.<br>
            If you didn't request this, please ignore this email or contact support if you have concerns.
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #95a5a6; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      // Gửi email
      await transporter.sendMail(mailOptions);

      // Trong môi trường development, trả về token để test
      if (process.env.NODE_ENV === "development") {
        return {
          message: "Reset password link has been sent to your email",
          resetToken, // Chỉ trả về trong môi trường development
        };
      }

      return {
        message: "Reset password link has been sent to your email",
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new BadRequestError("Failed to send reset password email");
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Kiểm tra user có tồn tại không
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestError("User not found");
      }

      // Hash password mới
      const hashedPassword = await bcrypt.hash(
        newPassword,
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );

      // Cập nhật password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: "Password has been reset successfully" };
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new BadRequestError("Invalid or expired reset token");
      }
      throw error;
    }
  }

  async googleLogin(googleData) {
    // Validate input
    const { error } = googleLoginSchema.validate(googleData);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    try {
      // Verify Google token
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: googleData.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (payload.email !== googleData.email) {
        throw new BadRequestError("Invalid Google token");
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: googleData.email },
      });

      if (!user) {
        // Create new user and patient
        const result = await prisma.$transaction(async (prisma) => {
          const newUser = await prisma.user.create({
            data: {
              email: googleData.email,
              full_name: googleData.full_name,
              role: "patient",
              sso_provider: "google",
              is_active: true,
            },
          });

          const patient = await prisma.patient.create({
            data: {},
          });

          return { user: newUser, patient };
        });

        user = result.user;
      } else if (user.sso_provider !== "google") {
        throw new BadRequestError(
          "Email already registered with different provider"
        );
      }

      // Generate tokens
      const tokens = generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  async facebookLogin(facebookData) {
    // Validate input
    const { error } = facebookLoginSchema.validate(facebookData);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    try {
      // Verify Facebook token
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,email,name&access_token=${facebookData.token}`
      );

      if (response.data.email !== facebookData.email) {
        throw new BadRequestError("Invalid Facebook token");
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: facebookData.email },
      });

      if (!user) {
        // Create new user and patient
        const result = await prisma.$transaction(async (prisma) => {
          const newUser = await prisma.user.create({
            data: {
              email: facebookData.email,
              full_name: facebookData.full_name,
              role: "patient",
              sso_provider: "facebook",
              is_active: true,
            },
          });

          const patient = await prisma.patient.create({
            data: {},
          });

          return { user: newUser, patient };
        });

        user = result.user;
      } else if (user.sso_provider !== "facebook") {
        throw new BadRequestError(
          "Email already registered with different provider"
        );
      }

      // Generate tokens
      const tokens = generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      throw new BadRequestError(error.message);
    }
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        address: true,
        gender: true,
        date_of_birth: true,
        sso_provider: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        password: true,
      },
    });
    return user;
  }
}

module.exports = new AuthService();
