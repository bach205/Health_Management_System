const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");
const { createNurseSchema, updateNurseSchema } = require("../validators/auth.validator");
const bcrypt = require("bcrypt");
const { generateRandomPassword } = require("../utils/randomPasswordGenerate");
const { sendStaffNewPasswordEmail } = require("../utils/staff.email");

class NurseService {
    async findAllNurse(query) {
        try {
            const { keyword = '', sort = 'stt', shift } = query;

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

            // If shift filter is provided, get nurses with that shift
            let nurses;
            if (shift) {
                // Get work schedules for the specified shift
                const workSchedules = await prisma.workSchedule.findMany({
                    where: {
                        shift_id: parseInt(shift)
                    },
                    select: {
                        user_id: true
                    }
                });

                // Get unique user IDs from work schedules
                const userIds = [...new Set(workSchedules.map(ws => ws.user_id))];

                // Add user IDs to where clause
                whereClause.id = {
                    in: userIds
                };
            }

            nurses = await prisma.user.findMany({
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
                    updated_at: true,
                    avatar: true
                },
                orderBy: orderBy
            });

            if (!nurses) {
                throw new BadRequestError("Có lỗi trong quá trình lấy tất cả tài khoản, vui lòng thử lại!");
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
                // 'phone',
                'password',
                'gender',
            ];
            if (!nurseData.password || nurseData.password.trim() === '') {
                const password = generateRandomPassword(10);
                nurseData.password = password;
            }
            for (const field of requiredFields) {
                if (!nurseData[field] || nurseData[field].trim() === '') {
                    throw new BadRequestError(`${field.replace('_', ' ')} không được để trống`);
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
                throw new BadRequestError("Email đã tồn tại");
            }
            // Check if phone already exists
            /*
            if (value.phone) {
                const existingPhone = await prisma.user.findUnique({
                    where: { phone: value.phone }
                });
                if (existingPhone) {
                    throw new BadRequestError("Số điện thoại đã tồn tại");
                }
            }
            */
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
                    phone: value.phone || null,
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
            sendStaffNewPasswordEmail(nurseData.email, nurseData.password);

            if (!nurse) {
                throw new BadRequestError("Có lỗi trong quá trình tạo tài khoản, vui lòng thử lại!");
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
                throw new BadRequestError("Không tìm thấy tài khoản");
            }

            // Check for empty fields in update data
            const requiredFields = [
                'full_name',
                'email',
                // 'phone',
                'gender',
                // 'date_of_birth',
                // 'address',
            ];

            for (const field of requiredFields) {
                if (updateData[field] && updateData[field].trim() === '') {
                    throw new BadRequestError(`${field.replace('_', ' ')} không được để trống`);
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
                    throw new BadRequestError("Email đã tồn tại");
                }
            }

            // Check if new phone already exists (if phone is being updated)
            /*
            if (updateData.phone && updateData.phone !== existingNurse.phone) {
                const existingPhone = await prisma.user.findUnique({
                    where: { phone: value.phone }
                });
                if (existingPhone && existingPhone.id !== existingNurse.id) {
                    throw new BadRequestError("Số điện thoại đã tồn tại");
                }
            }
            */

            // Create update data object with only changed fields
            const updateFields = {};
            // for (const field of requiredFields) {
            //     if (updateData[field] && updateData[field] !== existingNurse[field]) {
            //         updateFields[field] = value[field];
            //     }
            // }
            // console.log(updateData)
            // console.log(existingNurse,existingNurse.date_of_birth)

            const updatedfields = [
                'full_name',
                'email',
                'gender',
                'date_of_birth',
                'address',
                'phone',
            ];
            for (const field of updatedfields) {
                if (field === 'date_of_birth') {
                    // Special handling for date_of_birth
                    if (updateData[field] !== undefined &&
                        (updateData[field] === null || existingNurse[field] === null ||
                            new Date(updateData[field]).getTime() !== new Date(existingNurse[field]).getTime())) {
                        updateFields[field] = value[field];
                    }
                } else if (updateData[field] && updateData[field] !== existingNurse[field]) {
                    updateFields[field] = value[field];
                }
                if (field === 'address') {
                    // Special handling for date_of_birth
                    if (updateData[field] !== undefined &&
                        (updateData[field] === null || existingNurse[field] === null ||
                            new Date(updateData[field]).getTime() !== new Date(existingNurse[field]).getTime())) {
                        updateFields[field] = value[field];
                    }
                } else if (updateData[field] && updateData[field] !== existingNurse[field]) {
                    updateFields[field] = value[field];
                }
                if (field === 'phone') {
                    // Special handling for date_of_birth
                    if (updateData[field] !== undefined &&
                        (updateData[field] === null || existingNurse[field] === null ||
                            new Date(updateData[field]).getTime() !== new Date(existingNurse[field]).getTime())) {
                        updateFields[field] = value[field];
                    }
                } else if (updateData[field] && updateData[field] !== existingNurse[field]) {
                    updateFields[field] = value[field];
                }

            }

            // If no fields to update, return existing nurse
            if (Object.keys(updateFields).length === 0) {
                throw new BadRequestError("Không có thay đổi nào để cập nhật");
            }

            // Update nurse with only changed fields
            const updatedNurse = await prisma.user.update({
                where: { id: nurseId },
                data: updateFields
            });

            if (!updatedNurse) {
                throw new BadRequestError("Có lỗi trong quá trình cập nhật tài khoản, vui lòng thử lại!");
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
                throw new BadRequestError("Không tìm thấy tài khoản");
            }
            if (existingNurse.role !== "nurse") {
                throw new BadRequestError("Tài khoản không phải là bác sĩ");
            }

            // Toggle is_active status
            const updatedNurse = await prisma.user.update({
                where: { id: nurseId },
                data: {
                    is_active: !existingNurse.is_active
                }
            });

            if (!updatedNurse) {
                throw new BadRequestError("Có lỗi trong quá trình cập nhật trạng thái tài khoản, vui lòng thử lại!");
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
                throw new Error("Không tìm thấy tài khoản");
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
                throw new BadRequestError("Có lỗi trong quá trình đặt lại mật khẩu, vui lòng thử lại!");
            }

            return {
                status: 200,
                data: {
                    message: "Đặt lại mật khẩu thành công"
                }
            };
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    deleteNurse = async (nurseId) => {
        try {
            nurseId = parseInt(nurseId, 10);
            const existingNurse = await prisma.user.findUnique({
                where: { id: nurseId }
            });
            if (!existingNurse) {
                throw new BadRequestError("Không tìm thấy tài khoản");
            }
            if (existingNurse.role !== "nurse") {
                throw new BadRequestError("Tài khoản không phải là nurse");
            }
            const deletedNurse = await prisma.user.delete({
                where: { id: nurseId }
            });
            console.log(deletedNurse)
            return deletedNurse;
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
async createNursesFromCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new BadRequestError("Dữ liệu CSV không hợp lệ.");
  }

  const preparedData = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const nurseData = {
      full_name: row.full_name?.trim(),
      email: row.email?.trim(),
      phone: row.phone?.trim() || null,
      password: row.password?.trim(),
      gender: row.gender?.trim(),
      date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : null,
      address: row.address?.trim() || null,
      bio: row.bio?.trim() || '',
    };

    // Tạo password nếu chưa có
    if (!nurseData.password) {
      nurseData.password = generateRandomPassword(10);
    }

    // Validate ngày sinh hợp lệ
    if (nurseData.date_of_birth && isNaN(nurseData.date_of_birth.getTime())) {
      throw new BadRequestError(`Dòng ${i + 1}: Ngày sinh không hợp lệ`);
    }

    // Validate với Joi
    const { error, value } = createNurseSchema.validate(nurseData, { abortEarly: false });
    if (error) {
      throw new BadRequestError(`Dòng ${i + 1}: ${error.details.map(d => d.message).join(', ')}`);
    }

    // Kiểm tra email trùng
    const existingEmail = await prisma.user.findUnique({ where: { email: value.email } });
    if (existingEmail) {
      throw new BadRequestError(`Dòng ${i + 1}: Email ${value.email} đã tồn tại`);
    }

    // Nếu có phone thì kiểm tra trùng
    // if (value.phone) {
    //   const existingPhone = await prisma.user.findUnique({ where: { phone: value.phone } });
    //   if (existingPhone) {
    //     throw new BadRequestError(`Dòng ${i + 1}: Số điện thoại ${value.phone} đã tồn tại`);
    //   }
    // }

    const hashedPassword = await bcrypt.hash(
      value.password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    preparedData.push({
      full_name: value.full_name,
      email: value.email,
      phone: value.phone,
      password: hashedPassword,
      gender: value.gender,
      date_of_birth: value.date_of_birth,
      address: value.address,
      bio: value.bio,
      rawPassword: nurseData.password, // để gửi email sau
    });
  }

  // Tạo trong transaction nếu tất cả đều hợp lệ
  const nurses = await prisma.$transaction(
    preparedData.map((nurse) =>
      prisma.user.create({
        data: {
          full_name: nurse.full_name,
          email: nurse.email,
          phone: nurse.phone,
          password: nurse.password,
          gender: nurse.gender,
          date_of_birth: nurse.date_of_birth,
          role: "nurse",
          address: nurse.address,
          bio: nurse.bio,
          is_active: true,
          sso_provider: "local",
        },
      })
    )
  );

  // Gửi email sau khi tạo thành công
  nurses.forEach((nurse, index) => {
    const rawPassword = preparedData[index].rawPassword;
    sendStaffNewPasswordEmail(nurse.email, rawPassword);
  });

  return nurses;
}


}

module.exports = new NurseService();
