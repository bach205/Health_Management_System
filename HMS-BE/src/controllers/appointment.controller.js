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
