const { CREATED, OK } = require("../core/success.response");
const DoctorService = require("../services/doctor.service");

class DoctorController {

  createDoctor = async (req, res) => {
    const result = await DoctorService.createDoctor(req.body);
    return new CREATED({
      message: "Tạo bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  getDoctors = async (req, res) => {
    const result = await DoctorService.getDoctors(req.body);
    return new OK({
      message: "Lấy danh sách bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  getAllDoctors = async (req, res) => {
    const result = await DoctorService.findAllDoctor();
    return new OK({
      message: "Lấy danh sách bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  getAllDoctorsWithAvgRating = async (req, res) => {
    const result = await DoctorService.getAllDoctorsWithAvgRating(req.body);
    return new OK({
      message: "Lấy danh sách bác sĩ kèm rating thành công",
      metadata: result,
    }).send(res);
  }


  updateDoctor = async (req, res) => {
    const result = await DoctorService.updateDoctor(req.body);
    return new OK({
      message: "Cập nhật bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  changeActive = async (req, res) => {
    const result = await DoctorService.changeActive(req.body);
    return new OK({
      message: "Thay đổi trạng thái bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  updatePassword = async (req, res) => {
    const result = await DoctorService.updatePassword(req.body);
    return new OK({
      message: "Cập nhật mật khẩu thành công",
    }).send(res);
  }

  getDoctorById = async (req, res) => {
    const result = await DoctorService.getDoctorById(req.params.id);
    return new OK({
      message: "Lấy bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  getDoctorsInClinic = async (req, res) => {
    const result = await DoctorService.getDoctorsInClinic(req.params.clinicId);
    return new OK({
      message: "Lấy danh sách bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  getDoctorAvailableSlots = async (req, res) => {
    const result = await DoctorService.getDoctorAvailableSlots(req.params.doctorId);
    return new OK({
      message: "Lấy danh sách slot khả dụng thành công",
      metadata: result,
    }).send(res);
  }

  updateDoctorInfo = async (req, res) => {
    const result = await DoctorService.updateDoctorInfo(req.body);
    return new OK({
      message: "Cập nhật thông tin bác sĩ thành công",
      metadata: result,
    }).send(res);
  }

  updateStaffInfo = async (req, res) => {
    const result = await DoctorService.updateStaffInfo(req.body);
    return new OK({
      message: "Cập nhật thông tin nhân viên thành công",
      metadata: result,
    }).send(res);
  }

  createDoctorsFromCSV = async (req, res) => {
    const result = await DoctorService.createDoctorsFromCSV(req.body);
    return new OK({
      message: "Tạo bác sĩ từ file CSV thành công",
      metadata: result,
    }).send(res);
  }
  getAvailableDoctorsWithNearestSlot = async (req, res, next) => {
    try {
      const { clinicId } = req.params;
      const { after_date, after_time } = req.query;
      const doctors = await DoctorService.getAvailableDoctorsWithNearestSlot(clinicId, after_date, after_time);
      res.status(200).json({ success: true, message: "Lấy danh sách bác sĩ rảnh và slot gần nhất thành công", data: doctors });
    } catch (error) {
      next(error);
    }
  };

}

module.exports = new DoctorController();
