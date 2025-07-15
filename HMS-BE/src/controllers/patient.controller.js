const { CREATED, OK } = require("../core/success.response");
const PatientService = require("../services/patient.service");

class PatientController {
    createPatient = async (req, res) => {
        const result = await PatientService.createPatient(req.body);
        return new CREATED({
            message: "Patient created successfully",
            metadata: result,
        }).send(res);
    }

    getPatients = async (req, res) => {
        const result = await PatientService.getPatients(req.body);
        return new OK({
            message: "Patients retrieved successfully",
            metadata: result,
        }).send(res);
    }

    getAllPatients = async (req, res) => {
        const result = await PatientService.findAllPatients();
        return new OK({
            message: "All patients retrieved successfully",
            metadata: result,
        }).send(res);
    }

    updatePatient = async (req, res) => {
        const result = await PatientService.updatePatient(req.body);
        return new OK({
            message: "Patient updated successfully",
            metadata: result,
        }).send(res);
    }

    changeActive = async (req, res) => {
        const result = await PatientService.changeActive(req.body);
        return new OK({
            message: "Patient status updated successfully",
            metadata: result,
        }).send(res);
    }

    updatePassword = async (req, res) => {
        const result = await PatientService.updatePassword(req.body);
        return new OK({
            message: "Patient password reset successfully",
            metadata: result,
        }).send(res);
    }

    getPatientById = async (req, res) => {
        const result = await PatientService.getPatientById(req.params.id);
        return new OK({
            message: "Patient retrieved successfully",
            metadata: result,
        }).send(res);
    }

    // Lấy bệnh nhân và hồ sơ khám gần nhất có đơn thuốc theo số CCCD
    getPatientByIdentityNumber = async (req, res) => {
        const { identity_number } = req.body;
        const result = await PatientService.getPatientByIdentityNumber(identity_number);
        return new OK({
            message: "Lấy thông tin bệnh nhân và đơn thuốc thành công",
            metadata: result,
        }).send(res);
    }
}

module.exports = new PatientController(); 