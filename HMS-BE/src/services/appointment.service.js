const prisma = require("../config/prisma");
const { BadRequestError } = require("../core/error.response");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class AppointmentService {
  async bookAppointment(data) {
    // 1. Kiểm tra slot còn trống không
    const slot = await prisma.availableSlot.findFirst({
      where: {
        doctor_id: data.doctor_id,
        clinic_id: data.clinic_id,
        slot_date: new Date(data.appointment_date),
        start_time: new Date(`1970-01-01T${data.appointment_time}`),
        is_available: true,
      },
    });
    if (!slot)
      throw new BadRequestError(
        "Khung giờ này đã được đặt hoặc không tồn tại!"
      );

    // 2. Kiểm tra bệnh nhân đã có lịch trùng chưa
    const exist = await prisma.appointment.findFirst({
      where: {
        patient_id: data.patient_id,
        appointment_date: new Date(data.appointment_date),
        appointment_time: new Date(`1970-01-01T${data.appointment_time}`),
        status: { in: ["pending", "confirmed"] },
      },
    });
    if (exist)
      throw new BadRequestError("Bạn đã có lịch hẹn vào khung giờ này!");

    // 3. Tạo lịch hẹn
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

    // 4. Cập nhật slot thành không còn trống
    await prisma.availableSlot.update({
      where: { id: slot.id },
      data: { is_available: false },
    });

    return appointment;
  }

  async getAvailableSlots({ doctor_id, clinic_id, appointment_date }) {
    // Lấy các slot còn trống cho bác sĩ, phòng khám, ngày
    const slots = await prisma.availableSlot.findMany({
      where: {
        doctor_id: parseInt(doctor_id),
        clinic_id: parseInt(clinic_id),
        slot_date: new Date(appointment_date),
        is_available: true,
      },
      orderBy: { start_time: "asc" },
      include: {
        doctor: true,
        clinic: true
      }
    });
    return slots;
  }

  async getPatientAppointments({ patient_id }) {
    // Lấy lịch sử đặt lịch của bệnh nhân
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

  async confirmAppointment({ appointment_id }) {
    // Xác nhận lịch hẹn (bác sĩ/lễ tân)
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(appointment_id) },
      data: { status: "confirmed" },
      include: {
        patient: true,
        doctor: true,
        clinic: true
      }
    });
    return appointment;
  }

  async cancelAppointment({ appointment_id, reason }) {
    // Hủy lịch hẹn, cập nhật slot thành available
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(appointment_id) },
      data: { status: "cancelled", note: reason },
      include: {
        patient: true,
        doctor: true,
        clinic: true
      }
    });

    // Tìm slot liên quan và mở lại
    await prisma.availableSlot.updateMany({
      where: {
        doctor_id: appointment.doctor_id,
        clinic_id: appointment.clinic_id,
        slot_date: appointment.appointment_date,
        start_time: appointment.appointment_time,
      },
      data: { is_available: true },
    });
    return appointment;
  }

  async getAppointmentDetail({ appointment_id }) {
    // Lấy chi tiết một lịch hẹn
    const appointment = await prisma.$queryRaw`
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
      WHERE a.id = ${appointment_id}
    `;

    if (!appointment || appointment.length === 0) {
      throw new BadRequestError("Không tìm thấy lịch hẹn!");
    }

    return appointment[0];
  }

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
        patient_id: data.patient_id,
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
