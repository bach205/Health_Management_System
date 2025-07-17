import instance from "../api/mainRequest";
const BASE_URL_RECORD = "api/v1/examination-record";
const BASE_URL_ORDER = "api/v1/examination-order";

export const getAppointmentRecordByAppointmentId = async (appointmentId: number) => {
    return instance.get(`${BASE_URL_RECORD}/appointment/${appointmentId}`);
};

export const getPatientExaminationHistory = async (patientId: number) => {
    return instance.get(`${BASE_URL_RECORD}/patient/${patientId}/history`);
};

export const getAppointmentOrderByAppointmentId = async (appointmentId: number) => {
    return instance.get(`${BASE_URL_ORDER}/appointment/${appointmentId}/order`);
};
