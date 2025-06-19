const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const { sendStaffNewPasswordEmail } = require("../utils/staff.email");

class PatientService {
    async findAllPatients() {
        const users = await prisma.user.findMany({
            where: {
                role: "patient"
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                gender: true,
                patient: {
                    select: {
                        identity_number: true,
                        medical_history: true,
                    }
                }
            }
        });
        return users;
    }

    async getPatients({ keyword = "", sort = "newest", isActive = "all", page = 1, pageSize = 10 }) {
        const where = {
            role: "patient",    
            AND: [
                {
                    OR: [
                        { full_name: { contains: keyword } },
                        { email: { contains: keyword } },
                        { phone: { contains: keyword } }
                    ]
                }
            ]
        };

        if (isActive !== "all") {
            where.is_active = isActive === true;
        }

        const orderBy = {};
        switch (sort) {
            case "newest":
                orderBy.created_at = "desc";
                break;
            case "oldest":
                orderBy.created_at = "asc";
                break;
            case "name_asc":
                orderBy.full_name = "asc";
                break;
            case "name_desc":
                orderBy.full_name = "desc";
                break;
            default:
                orderBy.created_at = "desc";
        }

        const [patients, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    patient: true
                },
                orderBy,
                skip: (page - 1) * pageSize,
                take: parseInt(pageSize)
            }),
            prisma.user.count({ where })
        ]);

        return {
            patients,
            pagination: {
                current: parseInt(page),
                pageSize: parseInt(pageSize),
                total
            }
        };
    }

    async createPatient(data) {
        const { email, password, full_name, date_of_birth, gender, phone, address, identity_number } = data;

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new BadRequestError("Email đã tồn tại");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 
            parseInt(process.env.BCRYPT_SALT_ROUNDS)
        );

        const newPatient = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                full_name,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                gender,
                phone,
                address,
                role: "patient",
                is_active: true,
                patient: {
                    create: {
                        identity_number
                    }
                }
            },
            include: {
                patient: true
            }
        });

        return newPatient;
    }

    async updatePatient(data) {
        const { id, email, full_name, date_of_birth, gender, phone, address, identity_number } = data;

        // Check if patient exists
        const existingPatient = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
                role: "patient"
            }
        });

        if (!existingPatient) {
            throw new BadRequestError("Bệnh nhân không tồn tại");
        }

        // Check if email exists (if email is being changed)
        if (email !== existingPatient.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email }
            });

            if (emailExists) {
                throw new BadRequestError("Email đã tồn tại");
            }
        }

        const updatedPatient = await prisma.user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                email,
                full_name,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                gender,
                phone,
                address,
                patient: {
                    update: {
                        where: { user_id: parseInt(id) },
                        data: { identity_number }
                    }
                }
            },
            include: {
                patient: true
            }
        });

        return updatedPatient;
    }

    async changeActive({ id, isActive }) {
        const patient = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
                role: "patient"
            }
        });

        if (!patient) {
            throw new BadRequestError("Bệnh nhân không tồn tại");
        }

        const updatedPatient = await prisma.user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                is_active: isActive
            },
            include: {
                patient: true
            }
        });

        return updatedPatient;
    }

    async updatePassword({ id }) {
        const patient = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
                role: "patient"
            }
        });

        if (!patient) {
            throw new BadRequestError("Bệnh nhân không tồn tại");
        }

        // Generate random password
        const newPassword = this.#createRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 
            parseInt(process.env.BCRYPT_SALT_ROUNDS)
        );

        await prisma.user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                password: hashedPassword
            }
        });

        // Send email with new password
         sendStaffNewPasswordEmail(patient.email, newPassword);

        return true;
    }

    async getPatientById(id) {
        const patient = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
                role: "patient"
            },
            include: {
                patient: true,
                examination_records: {
                    include: {
                        examination_details: true,
                        prescriptions: {
                            include: {
                                prescription_items: true
                            }
                        }
                    }
                }
            }
        });

        if (!patient) {
            throw new BadRequestError("Bệnh nhân không tồn tại");
        }

        return patient;
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

        const totalLength = 6;

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
}

module.exports = new PatientService(); 