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
        start_time: data.appointment_time,
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
        appointment_time: data.appointment_time,
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
        appointment_time: data.appointment_time,
        reason: data.reason,
        note: data.note,
        status: "pending",
      },
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
        doctor_id,
        clinic_id,
        slot_date: new Date(appointment_date),
        is_available: true,
      },
      orderBy: { start_time: "asc" },
    });
    return slots;
  }

  async getPatientAppointments({ patient_id }) {
    // Lấy lịch sử đặt lịch của bệnh nhân
    const appointments = await prisma.appointment.findMany({
      where: { patient_id },
      orderBy: [{ appointment_date: "desc" }, { appointment_time: "desc" }],
    });
    return appointments;
  }

  async confirmAppointment({ appointment_id }) {
    // Xác nhận lịch hẹn (bác sĩ/lễ tân)
    const appointment = await prisma.appointment.update({
      where: { id: appointment_id },
      data: { status: "confirmed" },
    });
    return appointment;
  }

  async cancelAppointment({ appointment_id, reason }) {
    // Hủy lịch hẹn, cập nhật slot thành available
    const appointment = await prisma.appointment.update({
      where: { id: appointment_id },
      data: { status: "cancelled", note: reason },
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
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointment_id },
    });
    if (!appointment) throw new BadRequestError("Không tìm thấy lịch hẹn!");
    return appointment;
  }
}

module.exports = new AppointmentService();
