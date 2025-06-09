const appointmentService = require("../services/appointment.service");
const {
  bookAppointmentSchema,
  getAvailableSlotsSchema,
  getPatientAppointmentsSchema,
  confirmAppointmentSchema,
  cancelAppointmentSchema,
  getAppointmentDetailSchema,
  nurseBookAppointmentSchema,
} = require("../validators/appointment.validator");

exports.bookAppointment = async (req, res, next) => {
  try {
    const { error } = bookAppointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await appointmentService.bookAppointment(req.body);
    res.status(201).json({
      success: true,
      message: "Đặt lịch thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { error } = getAvailableSlotsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const slots = await appointmentService.getAvailableSlots(req.query);
    res.status(200).json({
      success: true,
      message: "Lấy danh sách slot trống thành công",
      data: slots
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientAppointments = async (req, res, next) => {
  try {
    const patient_id = parseInt(req.params.id);

    if (isNaN(patient_id)) {
      return res.status(400).json({
        success: false,
        message: "ID bệnh nhân không hợp lệ"
      });
    }

    const { error } = getPatientAppointmentsSchema.validate({
      patient_id: patient_id
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const appointments = await appointmentService.getPatientAppointments({
      patient_id: patient_id
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách lịch hẹn thành công",
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmAppointment = async (req, res, next) => {
  try {
    const { error } = confirmAppointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await appointmentService.confirmAppointment(req.body);
    res.status(200).json({
      success: true,
      message: "Xác nhận lịch hẹn thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const { error } = cancelAppointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await appointmentService.cancelAppointment(req.body);
    res.status(200).json({
      success: true,
      message: "Huỷ lịch hẹn thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentDetail = async (req, res, next) => {
  try {
    const appointment_id = parseInt(req.params.id);

    if (isNaN(appointment_id)) {
      return res.status(400).json({
        success: false,
        message: "ID lịch hẹn không hợp lệ"
      });
    }

    const { error } = getAppointmentDetailSchema.validate({
      appointment_id: appointment_id
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const appointment = await appointmentService.getAppointmentDetail({
      appointment_id: appointment_id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn"
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết lịch hẹn thành công",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách tất cả lịch hẹn thành công",
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

exports.nurseBookAppointment = async (req, res, next) => {
  try {

    const { error } = nurseBookAppointmentSchema.validate(req.body);
    if (error) {
      console.log(error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    console.log(1)
    const result = await appointmentService.nurseBookAppointment(req.body);
    res.status(201).json({
      success: true,
      message: "Đặt lịch thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
