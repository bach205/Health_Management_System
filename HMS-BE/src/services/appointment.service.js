const prisma = require("../config/prisma");
const { BadRequestError } = require("../core/error.response");

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
}

module.exports = new AppointmentService();
