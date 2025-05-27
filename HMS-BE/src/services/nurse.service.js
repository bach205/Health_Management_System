const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");
const { createNurseSchema } = require("../validators/auth.validator");
const bcrypt = require("bcrypt");

class NurseService {
    async findAllNurse() {
        const users = await prisma.user.findMany();
        return users;
    }

    createNurse = async (nurseData) => {
        try {
            // Check for empty fields
            const requiredFields = [
                'full_name',
                'email',
                'phone',
                'password',
                'gender',
                'date_of_birth',
                'address',
                'department'
            ];

            for (const field of requiredFields) {
                if (!nurseData[field] || nurseData[field].trim() === '') {
                    throw new BadRequestError(`${field.replace('_', ' ')} cannot be empty`);
                }
            }

            // Validate input data using Joi schema
            const { error, value } = createNurseSchema.validate(nurseData, { abortEarly: false });
            if (error) {
                throw new BadRequestError(error.details.map(detail => detail.message).join(', '));
            }

            // Check if email already exists
            const existingEmail = await prisma.user.findUnique({
                where: { email: value.email }
            });
            if (existingEmail) {
                throw new BadRequestError("Email already exists");
            }

            // Check if phone number already exists
            const existingPhone = await prisma.user.findFirst({
                where: { phone: value.phone }
            });
            if (existingPhone) {
                throw new BadRequestError("Phone number already exists");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(
                value.password,
                parseInt(process.env.BCRYPT_SALT_ROUNDS)
            );
            // Create nurse
            const nurse = await prisma.user.create({
                data: {
                    full_name: value.full_name,
                    email: value.email,
                    phone: value.phone,
                    password: hashedPassword,
                    gender: value.gender,
                    date_of_birth: value.date_of_birth,
                    role: "nurse",
                    address: value.address,
                    department: value.department,
                    bio: value.bio,
                    is_active: true,
                    sso_provider: "local"
                },
            });

            if (!nurse) {
                throw new BadRequestError("There is some error in creating nurse, please try again!");
            }

            return nurse;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    updateNurse = async (nurseId, updateData) => {
        try {
            // Check if nurse exists
            const existingNurse = await prisma.user.findUnique({
                where: { id: nurseId }
            });
            if (!existingNurse) {
                throw new BadRequestError("Nurse not found");
            }
            if (existingNurse.role !== "nurse") {
                throw new BadRequestError("User is not a nurse");
            }

            // Check for empty fields in update data
            const requiredFields = [
                'full_name',
                'email',
                'phone',
                'gender',
                'date_of_birth',
                'address',
                'department'
            ];

            for (const field of requiredFields) {
                if (updateData[field] && updateData[field].trim() === '') {
                    throw new BadRequestError(`${field.replace('_', ' ')} cannot be empty`);
                }
            }

            // Validate input data using Joi schema
            const { error, value } = createNurseSchema.validate(updateData, { abortEarly: false });
            if (error) {
                throw new BadRequestError(error.details.map(detail => detail.message).join(', '));
            }

            // Check if new email already exists (if email is being updated)
            if (updateData.email && updateData.email !== existingNurse.email) {
                const existingEmail = await prisma.user.findUnique({
                    where: { email: value.email }
                });
                if (existingEmail) {
                    throw new BadRequestError("Email already exists");
                }
            }

            // Check if new phone number already exists (if phone is being updated)
            if (updateData.phone && updateData.phone !== existingNurse.phone) {
                const existingPhone = await prisma.user.findFirst({
                    where: { phone: value.phone }
                });
                if (existingPhone) {
                    throw new BadRequestError("Phone number already exists");
                }
            }

            // Update nurse
            const updatedNurse = await prisma.user.update({
                where: { id: nurseId },
                data: {
                    full_name: value.full_name,
                    email: value.email,
                    phone: value.phone,
                    gender: value.gender,
                    date_of_birth: value.date_of_birth,
                    address: value.address,
                    department: value.department,
                    bio: value.bio
                },
            });

            if (!updatedNurse) {
                throw new BadRequestError("There is some error in updating nurse, please try again!");
            }

            return updatedNurse;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
}

module.exports = new NurseService();
