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

            const updatedUser = {
                full_name: value.full_name,
                email: value.email,
                phone: value.phone?.trim() || "",
                gender: value.gender,
                date_of_birth: value.date_of_birth,
                address: value.address?.trim() || "",
            }
            if (value.avatar) {
                updatedUser.avatar = value.avatar;
            }
            const doctor = await prisma.user.update({
                where: { id: value.id },
                data: {
                    ...updatedUser,
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

    getAvailableDoctorsWithNearestSlot = async (clinicId, afterDate, afterTime) => {
        if (!clinicId) {
            throw new BadRequestError("Clinic ID không được để trống");
        }
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentTime = now.toTimeString().slice(0, 8);

        // Tìm tất cả slot rảnh trong clinic cụ thể
        const allSlots = await prisma.availableSlot.findMany({
            where: {
                clinic_id: Number(clinicId),
                is_available: true,
                doctor: {
                    role: 'doctor',
                },
            },
            orderBy: [
                { slot_date: 'asc' },
                { start_time: 'asc' },
            ],
            include: {
                doctor: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                },
                clinic: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
        });

        // Lọc slot hợp lệ (sau thời gian tham chiếu)
        const validSlots = allSlots.filter(slot => {
            const slotDate = new Date(slot.slot_date);
            const slotTime = slot.start_time instanceof Date ? slot.start_time.toTimeString().slice(0, 8) : slot.start_time;
            if (afterDate && afterTime) {
                // Slot sau ngày hoặc cùng ngày nhưng sau giờ
                if (slotDate > new Date(afterDate)) return true;
                if (slotDate.toISOString().slice(0,10) === afterDate && slotTime > afterTime) return true;
                return false;
            } else {
                // Mặc định: slot trong tương lai hoặc hôm nay nhưng chưa qua giờ hiện tại
                if (slotDate > today) return true;
                if (slotDate.getTime() === today.getTime() && slotTime > currentTime) return true;
                return false;
            }
        });

        // Group theo doctor_id để lấy slot gần nhất cho mỗi bác sĩ
        const doctorMap = new Map();
        for (const slot of validSlots) {
            const docId = slot.doctor_id;
            if (!doctorMap.has(docId)) {
                doctorMap.set(docId, {
                    doctor: slot.doctor,
                    nearestSlot: slot,
                    clinic: slot.clinic,
                });
            } else {
                const existingSlot = doctorMap.get(docId).nearestSlot;
                const existingDate = new Date(existingSlot.slot_date);
                const newDate = new Date(slot.slot_date);
                if (newDate < existingDate ||
                    (newDate.getTime() === existingDate.getTime() && slot.start_time < existingSlot.start_time)) {
                    doctorMap.set(docId, {
                        doctor: slot.doctor,
                        nearestSlot: slot,
                        clinic: slot.clinic,
                    });
                }
            }
        }
        const data = Array.from(doctorMap.values());
        console.log("data", data)
        return data;
    };


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

        const updatedUser = {
            full_name: updateData.full_name?.trim(),
            address: updateData.address?.trim(),
            phone: updateData.phone?.trim(),
            gender: updateData.gender,
            date_of_birth: updateData.date_of_birth,
        }
        if (updateData.avatar) {
            updatedUser.avatar = updateData.avatar;
        }

        const result = await prisma.$transaction(async (prisma) => {
            const updatedUser = await prisma.user.update({
                where: { id: updateData.id },
                data: updatedUser,
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
    async createDoctorsFromCSV(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new BadRequestError("Dữ liệu không hợp lệ");
        }

        const preparedData = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Tạo bản sao để tránh sửa gốc
            const doctorData = {
                full_name: row.full_name?.trim(),
                email: row.email?.trim(),
                phone: row.phone?.trim() || '',
                gender: row.gender || 'male',
                date_of_birth: row.date_of_birth,
                address: row.address?.trim() || '',
                // specialty_id: row.specialty_id || null,
                price: parseInt(row.price, 10),
                bio: row.bio?.trim() || '',
            };
            const specialty = await prisma.specialty.findUnique({
                where: {
                    name: row.specialty_name
                }
            });
            if (!specialty) {
                throw new BadRequestError(`Dòng ${i + 1}: Chuyên khoa ${row.specialty_name} không tồn tại`);
            }
            doctorData.specialty_id = specialty.id;


            if (row.avatar && row.avatar !== null && row.avatar !== "NULL" && row.avatar !== undefined) {
                doctorData.avatar = row.avatar
            }
            const randomPassword = this.#createRandomPassword().toString()
            // Tự tạo password nếu chưa có
            if (!doctorData.password) {
                doctorData.password = randomPassword;
            }

            // Validate bằng Joi schema
            const { error, value } = createDoctorSchema.validate(doctorData, { abortEarly: false });
            if (error) {
                throw new BadRequestError(`Dòng ${i + 1}: ${error.details[0].message}`);
            }

            // Kiểm tra email trùng
            const existing = await prisma.user.findUnique({ where: { email: value.email } });
            if (existing) {
                throw new BadRequestError(`Dòng ${i + 1}: Email ${value.email} đã tồn tại`);
            }

            // Kiểm tra phone trùng

            if (value.price < 0) {
                throw new BadRequestError(`Dòng ${i + 1}: Giá không hợp lệ`);
            }

            const hashedPassword = await bcrypt.hash(value.password, parseInt(process.env.BCRYPT_SALT_ROUNDS));

            // Chuẩn bị cho transaction
            preparedData.push({
                user: {
                    full_name: value.full_name,
                    email: value.email,
                    phone: value.phone,
                    password: hashedPassword,
                    gender: value.gender,
                    date_of_birth: value.date_of_birth,
                    address: value.address,
                    is_active: true,
                    role: 'doctor',
                    sso_provider: 'local',
                    avatar: value.avatar,
                },
                doctor: {
                    specialty_id: value.specialty_id,
                    bio: value.bio,
                    price: value.price,
                },
                randomPassword

                
            });
        }

        // Nếu không lỗi, tiến hành tạo tất cả trong transaction
        const result = await prisma.$transaction(
            preparedData.map((entry) =>
                prisma.user.create({
                    data: {
                        ...entry.user,
                        doctor: {
                            create: entry.doctor,
                        },
                    },
                    include: {
                        doctor: true,
                    },
                })
            )
        );

        // Send email
        preparedData.forEach((doctor, index) => {
            const rawPassword = doctor.randomPassword;
            sendStaffNewPasswordEmail(doctor.user.email, rawPassword);
        });

        return result;
    }

    async getAllDoctorsWithAvgRating(pagination = {}) {
        const { total, doctors } = await this.getDoctors(pagination);
        // Lấy rating trung bình cho từng bác sĩ
        const doctorIds = doctors.map(doc => doc.id);
        const ratings = await prisma.doctorRating.groupBy({
            by: ['doctor_id'],
            where: { doctor_id: { in: doctorIds } },
            _avg: { rating: true },
        });
        // Map doctorId -> avg_rating
        const ratingMap = {};
        ratings.forEach(r => {
            ratingMap[r.doctor_id] = Number(r._avg.rating) || 0;
        });
        // Gắn avg_rating vào từng bác sĩ
        const doctorsWithRating = doctors.map(doc => ({
            ...doc,
            avg_rating: ratingMap[doc.id] || 0,
        }));
        return { total, doctors: doctorsWithRating };
    } catch(error) {
        return {
            status: false,
            message: error.message
        };
    }
}

module.exports = new DoctorService();


