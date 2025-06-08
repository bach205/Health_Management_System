const appointmentService = require("../services/appointment.service");
const {
  bookAppointmentSchema,
} = require("../validators/appointment.validator");

exports.bookAppointment = async (req, res, next) => {
  try {
    // Validate input
    const { error } = bookAppointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const result = await appointmentService.bookAppointment(req.body);
    res
      .status(201)
      .json({ message: "Đặt lịch thành công", appointment: result });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { doctor_id, clinic_id, appointment_date } = req.query;
    if (!doctor_id || !clinic_id || !appointment_date) {
      return res.status(400).json({
        message: "Thiếu thông tin: cần doctor_id, clinic_id và appointment_date"
      });
    }

    const slots = await appointmentService.getAvailableSlots({
      doctor_id,
      clinic_id,
      appointment_date
    });
    res.status(200).json({
      message: "Lấy danh sách slot trống thành công",
      slots
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientAppointments = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Thiếu patient_id"
      });
    }

    const appointments = await appointmentService.getPatientAppointments({
      patient_id: id
    });
    res.status(200).json({
      message: "Lấy danh sách lịch hẹn thành công",
      appointments
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.body;
    if (!appointment_id) {
      return res.status(400).json({
        message: "Thiếu appointment_id"
      });
    }

    const result = await appointmentService.confirmAppointment({
      appointment_id
    });
    res.status(200).json({
      message: "Xác nhận lịch hẹn thành công",
      appointment: result
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const { appointment_id, reason } = req.body;
    if (!appointment_id) {
      return res.status(400).json({
        message: "Thiếu appointment_id"
      });
    }

    const result = await appointmentService.cancelAppointment({
      appointment_id,
      reason
    });
    res.status(200).json({
      message: "Huỷ lịch hẹn thành công",
      appointment: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentDetail = async (req, res, next) => {
  try {
    const { appointment_id } = req.query;
    if (!appointment_id) {
      return res.status(400).json({
        message: "Thiếu appointment_id"
      });
    }

    const appointment = await appointmentService.getAppointmentDetail({
      appointment_id
    });
    res.status(200).json({
      message: "Lấy chi tiết lịch hẹn thành công",
      appointment
    });
  } catch (error) {
    next(error);
  }
};
