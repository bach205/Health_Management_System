const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");
const { createDoctorSchema, updateDoctorSchema } = require("../validators/auth.validator");
const bcrypt = require("bcrypt");
const { sendStaffNewPasswordEmail } = require("../utils/staff.email");

class DoctorService {
    async findAllDoctor() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                gender: true,
                doctor: {
                    select: {
                        specialty: true,
                        bio: true,
                    }
                }
            }
        });
        return users;
    }

    createDoctor = async (doctorData) => {
        try {
            // Check for empty fields
            const requiredFields = [
                'full_name',
                'email',
                'gender',
            ];
            let sendEmail = false;
            if (!doctorData.password || doctorData.password.trim() === '') {
                const password = Math.floor(100000 + Math.random() * 900000);
                doctorData.password = password.toString();
                sendEmail = true;
            }
            // console.log(doctorData)

            for (const field of requiredFields) {
                if (!doctorData[field] || doctorData[field].trim() === '') {
                    throw new BadRequestError(`${field.replace('_', ' ')} không được để trống`);
                }
            }


            // Validate input data using Joi schema
            const { error, value } = createDoctorSchema.validate(doctorData, { abortEarly: false });
            if (error) {
                throw new BadRequestError(error.details[0].message);
            }

            // Check if email already exists
            const existingEmail = await prisma.user.findUnique({
                where: { email: value.email }
            });
            if (existingEmail) {
                throw new BadRequestError("Email đã tồn tại");
            }


            // Hash password
            const hashedPassword = await bcrypt.hash(
                value.password,
                parseInt(process.env.BCRYPT_SALT_ROUNDS)
            );
            

            // Create doctor
            const doctor = await prisma.user.create({
                data: {
                    full_name: value.full_name,
                    email: value.email,
                    phone: value.phone?.trim() || "",
                    password: hashedPassword,
                    gender: value.gender,
                    date_of_birth: value.date_of_birth,
                    role: "doctor",
                    address: value.address?.trim() || "",
                    is_active: true,
                    sso_provider: "local",
                    doctor: {
                        create: {
                            specialty: value.specialty?.trim() || "",
                            bio: value.bio?.trim() || "",
                        },
                    },
                },
                include: { doctor: true },
            });

            if (sendEmail) {
                sendStaffNewPasswordEmail(doctorData.email, doctorData.password);
            }

            if (!doctor) {
                throw new BadRequestError("Có lỗi xảy ra, vui lòng thử lại!");
            }

            return doctor;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    getDoctors = async (pagination = {}) => {
        function sort(sortBy) {
            if (sortBy === "newest") {
                return {
                    created_at: "desc",
                }
            } else if (sortBy === "oldest") {
                return {
                    created_at: "asc",
                }
            }
            else if (sortBy === "name_asc") {
                return {
                    full_name: "asc",
                }
            }
            else if (sortBy === "name_desc") {
                return {
                    full_name: "desc",
                }
            }
        }
        const { searchKey, specialty, sortBy, skip, limit, isActive } = pagination;
        console.log(searchKey, specialty, sortBy, skip, limit, isActive)
        try {
            const whereClause = {
                AND: [
                    { role: "doctor" }, // chỉ lấy user là doctor
                    searchKey && { full_name: { contains: searchKey, }, },
                    isActive !== "all" && { is_active: isActive },
                    specialty !== "all"
                        ? {
                            doctor: {
                                specialty: {
                                    equals: specialty,
                                },
                            },
                        }
                        : {
                            doctor: {
                                specialty: {
                                    contains: "",
                                },
                            },
                        },

                ].filter(Boolean),
            };
            const total = await prisma.user.count({
                where: whereClause,
            });

            const doctors = await prisma.user.findMany({
                where: whereClause,
                include: {
                    doctor: true,
                },
                orderBy: sort(sortBy),
                skip: skip || 0,
                take: limit || undefined,
            });

            return { total, doctors };
        } catch (error) {
            console.log(error)
            return {
                status: false,
                message: error.message
            };
        }

    };

    updateDoctor = async (doctorData) => {
        console.log(doctorData)
        try {
            const requiredFields = [
                'full_name',
                'gender',
                'id'
            ];

            for (const field of requiredFields) {
                if (!doctorData[field] || doctorData[field].length === 0) {
                    throw new BadRequestError(`${field.replace('_', ' ')} không được để trống`);
                }
            }

            // // Validate input data using Joi schema
            const { error, value } = updateDoctorSchema.validate(doctorData, { abortEarly: false });
            if (error) {
                console.log(error)
                throw new BadRequestError(error.details[0].message);
            }

            // Check if email already exists


            // Update user + doctor
            const doctor = await prisma.user.update({
                where: { id: value.id },
                data: {
                    full_name: value.full_name,
                    email: value.email,
                    phone: value.phone?.trim() || "",
                    gender: value.gender,
                    date_of_birth: value.date_of_birth,
                    address: value.address?.trim() || "",
                    doctor: {
                        upsert: {
                            update: {
                                bio: value.bio,
                                specialty: value.specialty,
                            },
                            create: {
                                bio: value.bio || "",
                                specialty: value.specialty || "",
                            },
                        },
                    },
                },
                include: { doctor: true },
            });

            return doctor;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    changeActive = async (body) => {
        console.log(body)
        try {
            if (!body.id || body.isActive === undefined || body.isActive === null) {
                throw new BadRequestError("Yêu cầu không hợp lệ");
            }
            // console.log(body)
            await prisma.user.update({
                where: { id: +body.id },
                data: { is_active: body.isActive }
            });
            return {
                status: true,
                message: "Đổi trạng thái thành công"
            };
        } catch (error) {
            throw new BadRequestError("Có lỗi xảy ra, vui lòng thử lại!");
        }
    }

    updatePassword = async (body) => {
        try {
            const { id } = body;
            const password = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedPassword = await bcrypt.hash(
                password,
                parseInt(process.env.BCRYPT_SALT_ROUNDS)
            );
            const user = await prisma.user.update({
                where: { id: +id },
                data: { password: hashedPassword }
            });
            sendStaffNewPasswordEmail(user.email, password);
            return {
                status: true,
                message: "Cập nhật mật khẩu thành công"
            };
        } catch (error) {
            console.log(error)
            throw new BadRequestError("Có lỗi xảy ra, vui lòng thử lại!");
        }
    }
}

module.exports = new DoctorService();
