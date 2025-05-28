const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");
const { createNurseSchema, updateNurseSchema } = require("../validators/auth.validator");
const bcrypt = require("bcrypt");

class NurseService {
    async findAllNurse(query) {
        try {
            const { keyword = '', sort = 'stt' } = query;

            // Build where clause for search
            const whereClause = {
                role: "nurse",
                OR: keyword ? [
                    { full_name: { contains: keyword } }
                ] : undefined
            };

            // Build orderBy clause for sorting
            let orderBy = {};
            switch (sort) {
                case 'name_asc':
                    orderBy = { full_name: 'asc' };
                    break;
                case 'name_desc':
                    orderBy = { full_name: 'desc' };
                    break;
                case 'created_at_desc':
                    orderBy = { created_at: 'desc' };
                    break;
                case 'created_at_asc':
                    orderBy = { created_at: 'asc' };
                    break;
                default: // 'stt'
                    orderBy = { id: 'asc' };
            }

            console.log('Search params:', { keyword, sort, whereClause }); // Debug log

            const nurses = await prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    date_of_birth: true,
                    address: true,
                    is_active: true,
                    created_at: true,
                    updated_at: true
                },
                orderBy: orderBy
            });

            if (!nurses) {
                throw new BadRequestError("Error fetching nurses");
            }

            return nurses;
        } catch (error) {
            console.error('Error in findAllNurse:', error); // Debug log
            throw new BadRequestError(error.message);
        }
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
                    date_of_birth: value.date_of_birth || null,
                    role: "nurse",
                    address: value.address || null,
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
            nurseId = parseInt(nurseId, 10);
            // Check if nurse exists
            const existingNurse = await prisma.user.findUnique({
                where: { id: nurseId }
            });
            if (!existingNurse) {
                throw new BadRequestError("Nurse not found");
            }

            // Check for empty fields in update data
            const requiredFields = [
                'full_name',
                'email',
                'phone',
                'gender',
                'date_of_birth',
                'address',
            ];

            for (const field of requiredFields) {
                if (updateData[field] && updateData[field].trim() === '') {
                    throw new BadRequestError(`${field.replace('_', ' ')} cannot be empty`);
                }
            }

            // Validate input data using Joi schema
            const { error, value } = updateNurseSchema.validate(updateData, { abortEarly: false });
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

            // Create update data object with only changed fields
            const updateFields = {};
            for (const field of requiredFields) {
                if (updateData[field] && updateData[field] !== existingNurse[field]) {
                    updateFields[field] = value[field];
                }
            }

            if (new Date(value["date_of_birth"]).getTime() === new Date(existingNurse["date_of_birth"]).getTime()) {
                delete updateFields["date_of_birth"];
            }

            // If no fields to update, return existing nurse
            if (Object.keys(updateFields).length === 0) {
                throw new BadRequestError("No changes to update");
            }

            // Update nurse with only changed fields
            const updatedNurse = await prisma.user.update({
                where: { id: nurseId },
                data: updateFields
            });

            if (!updatedNurse) {
                throw new BadRequestError("There is some error in updating nurse, please try again!");
            }

            return updatedNurse;
        } catch (error) {
            console.log(error)
            throw new BadRequestError(error.message);
        }
    }

    banNurse = async (nurseId) => {
        try {
            nurseId = parseInt(nurseId, 10);
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

            // Toggle is_active status
            const updatedNurse = await prisma.user.update({
                where: { id: nurseId },
                data: {
                    is_active: !existingNurse.is_active
                }
            });

            if (!updatedNurse) {
                throw new BadRequestError("There is some error in updating nurse status, please try again!");
            }

            return updatedNurse;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    resetPassword = async (nurseId) => {
        try {
            // Check if nurse exists
            const nurse = await prisma.user.findUnique({
                where: { id: parseInt(nurseId, 10) }
            });
            if (!nurse) {
                throw new Error("Nurse not found");
            }

            // Update password to default
            const defaultPassword = "123456"; // Default password
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            const updatedNurse = await prisma.user.update({
                where: { id: parseInt(nurseId, 10) },
                data: {
                    password: hashedPassword
                }
            });

            if (!updatedNurse) {
                throw new BadRequestError("There is some error in resetting password, please try again!");
            }

            return {
                status: 200,
                data: {
                    message: "Reset password successfully"
                }
            };
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
}

module.exports = new NurseService();
