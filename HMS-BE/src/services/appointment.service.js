const prisma = require("../config/prisma");
const { BadRequestError } = require("../core/error.response");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const QueueService = require("./queue.service");

class AppointmentService {
  /**
   * Đặt lịch khám thông thường (qua web/app)
   * @param {Object} data - Thông tin đặt lịch
   * @returns {Promise<Object>} Thông tin lịch hẹn đã tạo
   */
  async bookAppointment(data) {
    //đã test thành công
    // 1. Kiểm tra slot còn trống không (dùng raw query)
    console.log({
      doctor_id: data.doctor_id,
      clinic_id: data.clinic_id,
      slot_date: data.slot_date,
      start_time: data.start_time,
    });
    const slots = await prisma.$queryRaw`
      SELECT * FROM available_slots
      WHERE doctor_id = ${data.doctor_id}
        AND clinic_id = ${data.clinic_id}
        AND slot_date = ${data.slot_date}
        AND start_time = ${data.start_time}
        AND is_available = 1
    `;
    const slot = slots[0];
    if (!slot)
      throw new BadRequestError(
        "Khung giờ này đã được đặt hoặc không tồn tại!"
      );

    // 2. Kiểm tra bệnh nhân đã có lịch trùng chưa (raw query)
    const exist = await prisma.$queryRaw`
      SELECT * FROM appointments
      WHERE patient_id = ${data.patient_id}
        AND appointment_date = ${data.appointment_date}
        AND appointment_time = ${data.appointment_time}
        AND status IN ('pending', 'confirmed')
      LIMIT 1
    `;
    if (exist.length > 0)
      throw new BadRequestError("Bạn đã có lịch hẹn vào khung giờ này!");

    // 3. Tạo lịch hẹn với priority mặc định là 0 (normal) (raw query)
    await prisma.$executeRaw`
      INSERT INTO appointments (
        patient_id, doctor_id, clinic_id, appointment_date, appointment_time, reason, note, status, priority, created_at, updated_at
      ) VALUES (
        ${data.patient_id}, ${data.doctor_id}, ${data.clinic_id}, ${data.slot_date}, ${data.start_time}, ${data.reason}, ${data.note}, 'pending', 0, NOW(), NOW()
      )
    `;
    // Lấy appointment vừa tạo (raw query)
    const [appointment] = await prisma.$queryRaw`
      SELECT * FROM appointments
      WHERE patient_id = ${data.patient_id}
        AND doctor_id = ${data.doctor_id}
        AND clinic_id = ${data.clinic_id}
        AND appointment_date = ${data.appointment_date}
        AND appointment_time = ${data.appointment_time}
      ORDER BY id DESC
      LIMIT 1
    `;

    // 4. Cập nhật slot thành không còn trống (dùng raw query)
    await prisma.$executeRaw`
      UPDATE available_slots
      SET is_available = 0
      WHERE id = ${slot.id}
    `;

    return appointment;
  }

  /**
   * Lấy danh sách slot còn trống
   * @param {Object} params - Thông tin tìm kiếm slot
   * @returns {Promise<Array>} Danh sách slot còn trống
   */
  // chạy thành công 
  async getAvailableSlots({ doctor_id, clinic_id, slot_date }) {
    let query = `
      SELECT s.*, 
        u.full_name as doctor_name,
        u.role as doctor_role,
        c.name as clinic_name
      FROM available_slots s
      LEFT JOIN users u ON s.doctor_id = u.id
      LEFT JOIN clinics c ON s.clinic_id = c.id
      WHERE s.is_available = 1
      AND u.role = 'doctor'
    `;
    const params = [];

    if (doctor_id) {
      query += " AND s.doctor_id = ?";
      params.push(doctor_id);
    }
    if (clinic_id) {
      query += " AND s.clinic_id = ?";
      params.push(clinic_id);
    }
    if (slot_date) {
      query += " AND s.slot_date = ?";
      params.push(slot_date);
    }
    query += " ORDER BY s.start_time ASC";

    const slots = await prisma.$queryRawUnsafe(query, ...params);
    return slots;
  }

  /**
   * Lấy lịch sử đặt lịch của bệnh nhân
   * @param {Object} params - Thông tin bệnh nhân
   * @returns {Promise<Array>} Danh sách lịch hẹn
   */
  //chạy thành công
  async getPatientAppointments({ patient_id }) {
    const appointments = await prisma.$queryRaw`
      SELECT 
        a.*,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as formatted_date,
        TIME_FORMAT(a.appointment_time, '%H:%i:%s') as formatted_time,
        d.full_name as doctor_name,
        c.name as clinic_name
      FROM appointments a
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN clinics c ON a.clinic_id = c.id
      WHERE a.patient_id = ${patient_id}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    return appointments;
  }

  /**
   * Xác nhận lịch hẹn (bác sĩ/lễ tân)
   * @param {Object} params - Thông tin lịch hẹn
   * @returns {Promise<Object>} Thông tin lịch hẹn đã xác nhận
   */
  //chạy thành công
  async confirmAppointment({ appointment_id }) {
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(appointment_id) },
      data: { status: "confirmed" },
      include: {
        patient: true,
      }
    });
    return appointment;
  }

  /**
   * Hủy lịch hẹn
   * @param {Object} params - Thông tin lịch hẹn và lý do hủy
   * @returns {Promise<Object>} Thông tin lịch hẹn đã hủy
   */
  //chạy thành công
  async cancelAppointment({ appointment_id, reason }) {
    // 1. Cập nhật trạng thái lịch hẹn
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(appointment_id) },
      data: { status: "cancelled", note: reason },
      include: {
        patient: true,
      }
    });

    // 2. Hủy queue liên kết với appointment này
    await QueueService.cancelQueueByAppointment({ appointment_id });

    // 3. Mở lại slot
    await prisma.availableSlot.updateMany({
      where: {
        doctor_id: appointment.doctor_id,
        clinic_id: appointment.clinic_id,
        slot_date: appointment.slot_date,
        start_time: appointment.start_time,
      },
      data: { is_available: true },
    });

    return appointment;
  }

  // chạy thành công
  async getAllAppointments() {
    // Lấy tất cả lịch hẹn
    const appointments = await prisma.$queryRaw`
      SELECT 
        a.*,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as formatted_date,
        TIME_FORMAT(a.appointment_time, '%H:%i:%s') as formatted_time,
        p.identity_number,
        u.full_name as patient_name,
        u.email as patient_email,
        d.full_name as doctor_name,
        c.name as clinic_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON p.id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
      LEFT JOIN clinics c ON a.clinic_id = c.id
      ORDER BY a.id ASC
    `;

    return appointments;
  }

  /**
   * Đặt lịch qua y tá (có ưu tiên cao hơn khi trùng giờ)
   * @param {Object} data - Thông tin đặt lịch
   * @returns {Promise<Object>} Thông tin lịch hẹn đã tạo
   */
  // viết lại nhé anh Bách
  async nurseBookAppointment(data) {

    // 1. Kiểm tra slot còn trống không
    let slot = await prisma.$queryRaw`
  SELECT * FROM available_slots
  WHERE doctor_id = ${data.doctor_id}
    AND clinic_id = ${data.clinic_id}
    AND DATE(slot_date) = ${data.appointment_date}
    AND start_time = ${data.appointment_time}
    AND is_available = true
  LIMIT 1;
`;
    slot = slot[0]
    if (!slot)
      throw new BadRequestError(
        "Khung giờ này đã được đặt hoặc không tồn tại!"
      );
    console.log(slot)
    // 2. Kiểm tra email bệnh nhân đã tồn tại chưa
    let patient = await prisma.user.findUnique({
      where: { email: data.patient_email },
      include: { patient: true }
    });

    // 3. Nếu chưa tồn tại, tạo tài khoản mới cho bệnh nhân
    if (!patient) {
      // Tạo mật khẩu ngẫu nhiên
      const randomPassword = crypto.randomBytes(4).toString('hex');
      const hashedPassword = await bcrypt.hash(
        randomPassword,
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );

      // Tạo user và patient trong transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Tạo user

        const user = await prisma.user.create({
          data: {
            email: data.patient_email,
            password: hashedPassword,
            phone: data.patient_phone || "",
            role: "patient",
            sso_provider: "local",
            is_active: true,
          },
        });

        // Tạo patient
        const patient = await prisma.patient.create({
          data: {
            id: user.id,
            identity_number: data.identity_number || null,
          },
        });

        return { user, patient, password: randomPassword };
      });


      patient = result.user;
      data.patient_id = patient.id;
      data.generated_password = result.password;
    } else {
      data.patient_id = patient.id;
    }
    // 4. Kiểm tra bệnh nhân đã có lịch trùng chưa
    const exist = await prisma.appointment.findFirst({
      where: {
        email: data.email,
        appointment_date: new Date(data.appointment_date),
        appointment_time: new Date(`1970-01-01T${data.appointment_time}`),
        status: { in: ["pending", "confirmed"] },
      },
    });
    if (exist)
      throw new BadRequestError("Bệnh nhân đã có lịch hẹn vào khung giờ này!");

    // 5. Tạo lịch hẹn
    const appointment = await prisma.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        clinic_id: data.clinic_id,
        appointment_date: new Date(data.appointment_date),
        appointment_time: new Date(`1970-01-01T${data.appointment_time}`),
        reason: data.reason,
        note: data.note,
        status: "pending",
      },
      include: {
        patient: true,
        doctor: true,
        clinic: true
      }
    });

    // 6. Cập nhật slot thành không còn trống
    await prisma.availableSlot.update({
      where: { id: slot.id },
      data: { is_available: false },
    });

    return {
      appointment,
      generated_password: data.generated_password // Trả về mật khẩu nếu tạo tài khoản mới
    };
  }

}

module.exports = new AppointmentService();
