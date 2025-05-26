const { BadRequestError } = require("../core/error.response");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helper/jwt");

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
}

module.exports = new AuthService();
