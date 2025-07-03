const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");
const { createDoctorSchema, updateDoctorSchema } = require("../validators/auth.validator");
const bcrypt = require("bcrypt");
const { sendStaffNewPasswordEmail } = require("../utils/staff.email");

class DoctorService {
    async findAllDoctor() {
        const users = await prisma.user.findMany({
            where: {
                role: "doctor"
            },
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
                        price: true,
                    }
                }
            }
        });
        return users;
    }
    getDoctorById = async (id) => {
        const doctor = await prisma.user.findUnique({
            where: { id: +id, role: "doctor" },
            include: {
                doctor: {
                    include: {
                        specialty: true
                    }
                }
            }
        });
        return doctor;
    }

    createDoctor = async (doctorData) => {
        try {
            // Check for empty fields
            const requiredFields = [
                'full_name',
                'email',
                'gender',
                'price'
            ];
            let sendEmail = false;
            if (!doctorData.password || doctorData.password.trim() === '') {
                const password = this.#createRandomPassword();
                doctorData.password = password.toString();
                sendEmail = true;
            }

            for (const field of requiredFields) {
                if (!doctorData[field] || doctorData[field].toString().trim() === '') {
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

            // Check if phone already exists
            if (value.phone) {
                const existingPhone = await prisma.user.findUnique({
                    where: { phone: value.phone }
                });
                if (existingPhone) {
                    throw new BadRequestError("Số điện thoại đã tồn tại");
                }
            }
            if (value.price < 0) {
                throw new BadRequestError("Giá không hợp lệ");
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
                    avatar: value.avatar,
                    doctor: {
                        create: {
                            specialty_id: value.specialty_id || null,
                            bio: value.bio?.trim() || "",
                            price: value.price,
                        },
                    },
                },
                include: {
                    doctor: {
                        include: {
                            specialty: true
                        }
                    }
                },
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
            switch (sortBy) {
                case "newest":
                    return {
                        created_at: "desc",
                    }
                case "oldest":
                    return {
                        created_at: "asc",
                    }
                case "name_asc":
                    return {
                        full_name: "asc",
                    }
                case "name_desc":
                    return {
                        full_name: "desc",
                    }
                case "update_desc":
                    return {
                        updated_at: "desc",
                    }
                case "update_asc":
                    return {
                        updated_at: "asc",
                    }
                default:
                    return {
                        created_at: "desc",
                    }
            }
        }
        const { searchKey, specialty, sortBy, skip, limit, isActive } = pagination;
        console.log(searchKey, "specialty", specialty, sortBy, skip, limit, isActive)
        const specialties = specialty?.filter(specialty => specialty.trim() !== "");

        try {
            const isFilterAll = specialty.includes("all");
            const isFilterNone = specialty.includes("none");
            console.log("isFilterNone", isFilterNone)
            const isFilterSome = specialties.length > 0;
            const specialtyCondition = (isFilterNone || isFilterSome || isFilterAll) ? {
                OR: [
                    isFilterSome && {
                        doctor: {
                            specialty: {
                                name: {
                                    in: specialties,
                                }
                            },
                        },
                    },

                    isFilterNone && {
                        doctor: {
                            specialty_id: null,
                        },
                    },
                ].filter(Boolean),
            }
                : undefined;
            const allCondition = isFilterAll ? {
                doctor: {
                    specialty_id: {
                        not: null,
                    },
                }
            } : undefined;
            const whereClause = {
                AND: [
                    { role: "doctor" },
                    searchKey && { full_name: { contains: searchKey } },
                    isActive !== "all" && { is_active: isActive },
                    isFilterAll ? allCondition : specialtyCondition,

                ].filter(Boolean),
            };

            const total = await prisma.user.count({
                where: whereClause,
            });

            const doctors = await prisma.user.findMany({
                where: whereClause,
                include: {
                    doctor: {
                        include: {
                            specialty: true
                        }
                    },
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
        try {
            const requiredFields = [
                'full_name',
                'gender',
                'id',
                'price'
            ];

            for (const field of requiredFields) {
                if (!doctorData[field] || doctorData[field].toString().trim() === '') {
                    throw new BadRequestError(`${field.replace('_', ' ')} không được để trống`);
                }
            }

            // Validate input data using Joi schema
            const { error, value } = updateDoctorSchema.validate(doctorData, { abortEarly: false });
            if (error) {
                console.log(error)
                throw new BadRequestError(error.details[0].message);
            }

            // Check if email already exists
            const user = await prisma.user.findUnique({
                where: { id: value.id }
            });
            const existingEmail = await prisma.user.findUnique({
                where: { email: value.email }
            });
            if (existingEmail && existingEmail.id !== user.id) {
                throw new BadRequestError("Email đã tồn tại");
            }

            if (value.price < 0) {
                throw new BadRequestError("Giá không hợp lệ");
            }

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
                                specialty_id: value.specialty_id,
                                price: value.price,
                            },
                            create: {
                                bio: value.bio || "",
                                specialty_id: value.specialty_id,
                                price: value.price,
                            },
                        },
                    },
                },
                include: {
                    doctor: {
                        include: {
                            specialty: true
                        }
                    }
                },
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
            const password = this.#createRandomPassword();
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
    #createRandomPassword() {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";
        const special = "!@#$%^&*()_+[]{}?";

        const getRandom = (charset) => charset[Math.floor(Math.random() * charset.length)];

        const mustInclude = [
            getRandom(upper),
            getRandom(lower),
            getRandom(digits),
            getRandom(special),
        ];

        const totalLength = 8;

        const all = upper + lower + digits + special;
        while (mustInclude.length < totalLength) {
            mustInclude.push(getRandom(all));
        }

        for (let i = mustInclude.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = mustInclude[i];
            mustInclude[i] = mustInclude[j];
            mustInclude[j] = temp;
        }

        return mustInclude.join('');
    }

    getDoctorsInClinic = async (clinicId) => {
        const doctors = await prisma.user.findMany({
            where: {
                role: 'doctor',
                workSchedules: {
                    some: {
                        clinic_id: +clinicId,
                        work_date: {
                            // gte: new Date().setHours(0, 0, 0, 0),   // Tùy chọn: chỉ lấy lịch hôm nay
                            // lte: new Date().setHours(23, 59, 59, 999),
                        },
                    },
                },
            },
            include: {
                doctor: true,        // Thông tin từ bảng Doctor
                workSchedules: true, // Lịch làm việc (nếu cần)
            },
        });
        return doctors;
    }

    getDoctorAvailableSlots = async (doctorId) => {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        return prisma.availableSlot.findMany({
            where: {
                doctor_id: +doctorId,
                is_available: true,
                slot_date: {
                    //   gte: todayStart,
                    //   lte: todayEnd,
                },
            },
        });
    }
    async updateDoctorInfo(updateData) {
        const user = await prisma.user.findUnique({
            where: { id: updateData.id },
        });
        if (!user) {
            throw new BadRequestError("Bác sĩ không tồn tại");
        }
        if (user.role !== "doctor") {
            throw new BadRequestError("Bác sĩ không tồn tại");
        }

        if (updateData.price !== undefined && updateData.price < 0) {
            throw new BadRequestError("Giá không hợp lệ");
        }

        const result = await prisma.$transaction(async (prisma) => {
            const updatedUser = await prisma.user.update({
                where: { id: updateData.id },
                data: {
                    full_name: updateData.full_name?.trim(),
                    address: updateData.address?.trim(),
                    phone: updateData.phone?.trim(),
                    gender: updateData.gender,
                    date_of_birth: updateData.date_of_birth,
                },
            });

            const updatedDoctor = await prisma.doctor.update({
                where: { user_id: updateData.id },
                data: {
                    bio: updateData.bio?.trim(),
                    specialty_id: updateData.specialty_id,
                    price: updateData.price,
                },
                include: {
                    specialty: true
                }
            });

            return { user: updatedUser, doctor: updatedDoctor };
        });

        return result;
    }

    async updateStaffInfo({ userId, updateData }) {
        // console.log("updateData", updateData)
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new BadRequestError("Nhân viên không tồn tại");
        }
        if (user.role === "patient") {
            throw new BadRequestError("Nhân viên không tồn tại");
        }
        // Cập nhật thông tin trong transaction để đảm bảo tính nhất quán
        const result = await prisma.$transaction(async (prisma) => {
            // Cập nhật thông tin user
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    full_name: updateData.full_name?.trim(),
                    address: updateData.address?.trim(),
                    phone: updateData.phone?.trim(),
                    gender: updateData.gender,
                    date_of_birth: updateData.date_of_birth,
                },
            });

            return { user: updatedUser };
        });

        return result;
    }
}

module.exports = new DoctorService();


