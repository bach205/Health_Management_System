const appointmentService = require("../services/appointment.service");
const {
  bookAppointmentSchema,
  getAvailableSlotsSchema,
  getPatientAppointmentsSchema,
  confirmAppointmentSchema,
  cancelAppointmentSchema,
  nurseBookAppointmentSchema,
  nurseRescheduleAppointmentSchema,
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
    console.log(req.body);
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
    // const { error } = getAvailableSlotsSchema.validate(req.query);
    // if (error) {
    //   return res.status(400).json({
    //     success: false,
    //     message: error.details[0].message
    //   });
    // }

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

exports.nurseRescheduleAppointment = async (req, res, next) => {
  try {
    const { error } = nurseRescheduleAppointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await appointmentService.nurseRescheduleAppointment(req.body);
    res.status(201).json({
      success: true,
      message: "Đặt lại lịch thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment_id = parseInt(req.params.id);

    if (isNaN(appointment_id)) {
      return res.status(400).json({
        success: false,
        message: "ID lịch hẹn không hợp lệ"
      });
    }

    const appointment = await appointmentService.getAppointmentById(appointment_id);
    res.status(200).json({
      success: true,
      message: "Lấy thông tin lịch hẹn thành công",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

exports.getAvailableSlotsBySpecialty = async (req, res, next) => {
  try {
    const { specialty } = req.query;
    if (!specialty) {
      return res.status(400).json({ success: false, message: 'Thiếu chuyên môn (specialty)' });
    }
    const slots = await appointmentService.getAvailableSlotsBySpecialty(specialty);
    res.status(200).json({ success: true, message: 'Lấy danh sách slot trống theo chuyên môn thành công', data: slots });
  } catch (error) {
    next(error);
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment_id = parseInt(req.params.id);
    if (isNaN(appointment_id)) {
      return res.status(400).json({
        success: false,
        message: "ID lịch hẹn không hợp lệ"
      });
    }
    const result = await appointmentService.deleteAppointment(appointment_id);
    res.status(200).json({
      success: true,
      message: "Xóa lịch hẹn thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const appointment_id = parseInt(req.params.id);
    if (isNaN(appointment_id)) {
      return res.status(400).json({
        success: false,
        message: "ID lịch hẹn không hợp lệ"
      });
    }
    const result = await appointmentService.updateAppointment(appointment_id, req.body);
    res.status(200).json({
      success: true,
      message: "Cập nhật lịch hẹn thành công",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

