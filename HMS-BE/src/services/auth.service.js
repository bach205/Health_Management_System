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
    //console.log("userData: ", userData);
    const { error } = registerSchema.validate(userData);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    //   console.log(existingUser);

    if (existingUser) {
      throw new BadRequestError("Tài khoản đã tồn tại với email này");
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
          role: "patient", // Sử dụng string literal
          sso_provider: "local",
        },
      });

      // Create patient
      const patient = await prisma.patient.create({
        data: {
          id: user.id,
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
    console.log(updateData)

    // Cập nhật thông tin trong transaction để đảm bảo tính nhất quán
    const result = await prisma.$transaction(async (prisma) => {
      // Cập nhật thông tin user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          full_name: updateData.full_name,
          email: updateData.email,
          address: updateData.address,
          phone: updateData.phone,
          gender: updateData.gender,
          date_of_birth: updateData.date_of_birth,
        },
      });

      // Cập nhật thông tin patient (sử dụng cùng id với user)
      const updatedPatient = await prisma.patient.update({
        where: { id: userId },
        data: {
          identity_number: updateData.identity_number,
        },
      });

      return { user: updatedUser, patient: updatedPatient };
    });

    return result;
  }

  async forgetPassword(email) {
    // Kiểm tra user có tồn tại không
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestError("User not found");
    }

    // Tạo reset token với thêm thông tin bảo mật
    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
        purpose: "password_reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Tạo transporter cho nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Tạo nội dung email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${user.full_name || "there"},</p>
        <p>We received a request to reset your password. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    // Gửi email
    try {
      await transporter.sendMail(mailOptions);
      return {
        message: "Reset password email sent successfully",
        resetToken,
      };
    } catch (error) {
      throw new BadRequestError("Failed to send reset password email");
    }
  }

  async resetPassword(token, oldPassword, newPassword, confirmPassword) {
    try {
      // Verify token và kiểm tra thông tin bảo mật
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kiểm tra mục đích của token
      // if (!decoded.purpose || decoded.purpose !== "password_reset") {
      //   throw new BadRequestError("Invalid token purpose");
      // }

      // Kiểm tra thời gian tạo token (không cho phép token quá cũ)
      const tokenAge = Date.now() - decoded.timestamp;
      if (tokenAge > 3600000) {
        // 1 hour in milliseconds
        throw new BadRequestError("Token has expired");
      }

      const userId = decoded.id;

      // Kiểm tra user có tồn tại không
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestError("User not found");
      }

      // // Kiểm tra email trong token có khớp với user không
      // if (user.email !== decoded.email) {
      //   throw new BadRequestError("Invalid token");
      // }

      // Kiểm tra mật khẩu cũ
      const isValidOldPassword = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!isValidOldPassword) {
        throw new BadRequestError("Old password is incorrect");
      }

      // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestError(
          "New password must be different from old password"
        );
      }

      // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới có khớp nhau không
      if (newPassword !== confirmPassword) {
        throw new BadRequestError(
          "New password and confirm password do not match"
        );
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

      return { message: "Password has been changed successfully" };
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.name === "JsonWebTokenError") {
        throw new BadRequestError("Invalid token");
      }
      if (error.name === "TokenExpiredError") {
        throw new BadRequestError("Token has expired");
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
      }).catch(() => { throw new BadRequestError("Google token verification failed. Token is invalid or expired.") });
      const payload = ticket.getPayload();
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (!user) {
        // Create new user and patient
        const result = await prisma.$transaction(async (prisma) => {
          const newUser = await prisma.user.create({
            data: {
              email: payload.email,
              full_name: payload.name,
              role: "patient",
              sso_provider: "google",
              is_active: true,
            },
          });
          const patient = await prisma.patient.create({
            data: {
              id: newUser.id, // Set the patient id to match the user id
            },
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
      console.error("Google login error:", error);
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError("Failed to process Google login");
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
            data: {
              id: newUser.id,
            },
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
        avatar: true,
        patient: {
          select: {
            identity_number: true
          }
        }
      },
    });
    return user;
  }

  async updateAvatar(updateData) {
    // console.log(updateData.id, updateData.avatar[0])
    const user = await prisma.user.findUnique({
      where: { id: +updateData.id },
    });

    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    const base64 = updateData.avatar; // ví dụ dạng "data:image/png;base64,iVBORw0KGgoAAAANS..."

    // Lấy phần sau "base64,", vì chỉ phần đó là dữ liệu
    const base64Data = base64.split(',')[1] || base64;

    const sizeInKB = (base64Data.length * 3) / 4 / 1024;
    if (sizeInKB > 800) {
      throw new BadRequestError("Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn 800KB");
    }

    console.log(updateData.id, updateData.avatar.length)
    const updatedUser = await prisma.user.update({
      data: { avatar: base64 },
      where: {
        id: +updateData.id
      },
    });
    // console.log(updatedUser)

    return updatedUser;
  }

  async loginWithPhone({ phone, password }) {
    if (!phone || !password) {
      throw new BadRequestError("Vui lòng nhập số điện thoại và mật khẩu");
    }
    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
    });
    if (!user) {
      throw new BadRequestError("Số điện thoại hoặc mật khẩu không đúng");
    }
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError("Số điện thoại hoặc mật khẩu không đúng");
    }
    // Check if user is active
    if (!user.is_active) {
      throw new BadRequestError("Tài khoản đã bị khóa");
    }
    // Generate tokens
    const tokens = generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async registerWithPhone(userData) {
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
          role: "patient",
          sso_provider: "local",
        },
      });

      // Create patient
      const patient = await prisma.patient.create({
        data: {
          id: user.id,
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

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new BadRequestError("User not found");
      }

      if (!user.is_active) {
        throw new BadRequestError("Account is deactivated");
      }

      // Generate new tokens
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
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestError("Refresh token has expired. Please login again.");
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestError("Invalid refresh token");
      }
      throw error;
    }
  }

  async checkPasswordMatch(newPassword, confirmPassword, token) {
    try {
      if (newPassword === confirmPassword) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(
          newPassword,
          parseInt(process.env.BCRYPT_SALT_ROUNDS)
        );
        // Cập nhật password
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { password: hashedPassword },
        });

        return {
          success: true,
          message: 'Cập nhật mật khẩu thành công',
        };
      } else {
        throw new BadRequestError(
          'Mật khẩu nhập lại không khớp với mật khẩu mới',
        );
      }
    } catch (error) {
      throw error;
    }

  }
}

module.exports = new AuthService();
