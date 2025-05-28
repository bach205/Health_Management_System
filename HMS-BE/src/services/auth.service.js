const { BadRequestError } = require("../core/error.response");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const {generateToken} = require("../helper/jwt");

class AuthService {
    async register(userData) {
        // Validate input
        const { error } = registerSchema.validate(userData);
        if (error) {
            throw new BadRequestError(error.details[0].message);
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new BadRequestError('Email already registered');
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
                    full_name: userData.full_name,
                    phone: userData.phone,
                    role: 'patient', // Sử dụng giá trị enum
                    sso_provider: 'local'
                }
            });

            // Create patient
            const patient = await prisma.patient.create({
                data: {
                    full_name: userData.full_name,
                    phone: userData.phone,
                }
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
                role: result.user.role
            },
            patient: {
                id: result.patient.id,
                full_name: result.patient.full_name,
                phone: result.patient.phone
            },
            ...tokens
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
            where: { email }
        });

        if (!user) {
            throw new BadRequestError('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new BadRequestError('Invalid credentials');
        }

        // Check if user is active
        if (!user.is_active) {
            throw new BadRequestError('Account is deactivated');
        }

        // Nếu là patient, lấy thêm thông tin từ bảng patients
        let patientData = null;
        if (user.role === 'patient') {
            patientData = await prisma.patient.findFirst({
                where: {
                    full_name: user.full_name,
                    phone: user.phone
                }
            });
        }

        // Generate tokens
        const tokens = generateToken(user);

        // Trả về response tùy theo role
        if (user.role === 'patient' && patientData) {
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                },
                patient: {
                    id: patientData.id,
                    full_name: patientData.full_name,
                    phone: patientData.phone
                },
                ...tokens
            };
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            },
            ...tokens
        };
    }
}

module.exports = new AuthService()
