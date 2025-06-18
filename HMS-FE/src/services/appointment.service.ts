import mainRequest from "../api/mainRequest";
import axios from "axios";

const baseURL = `/api/v1`;

export interface AppointmentData {
  patientName: string;
  phoneNumber: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorId: string;
  symptoms: string;
}

export interface AppointmentFilters {
  status?: string;
  dateRange?: [string, string] | null;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getAvailableTimeSlotsService = async (docId: string) => {
  const response = await mainRequest.get(`${baseURL}/examination-detail/available-slots/${docId}`);

  return response.data;
};

export const getAllAppointmentsService = async () => {
  const response = await mainRequest.get(`${baseURL}/appointment/all`);
  return response.data;
};

export const confirmAppointmentService = async (appointmentId: any) => {
  console.log(appointmentId);
  const response = await mainRequest.post(`${baseURL}/appointment/confirm`, { appointment_id: appointmentId?.id });
  return response.data;
};

export const cancelAppointmentService = async (appointmentId: any) => {
  const response = await mainRequest.post(`${baseURL}/appointment/cancel`, { appointment_id: appointmentId?.id, reason: appointmentId?.reason });
  return response.data;
};

export const bookAppointmentService = async (appointmentData: any) => {
  const response = await mainRequest.post(`${baseURL}/appointment/book`, appointmentData);
  return response;
};

export const getPatientAppointmentsService = async (patientId: string | number) => {
  const response = await mainRequest.get(`/api/v1/appointment/patient/${patientId}`);
  return response.data;
};

export const updateAppointmentService = async (appointmentId: string | number, data: any) => {
  return mainRequest.put(`/api/v1/appointment/${appointmentId}`, data);
};

export const nurseBookAppointmentService = async (appointmentData: any) => {
  const response = await mainRequest.post(`${baseURL}/appointment/nurse-book`, appointmentData);
  return response.data;
};

export const getAllAvailableSlotsService = async () => {
  const response = await mainRequest.get(`/api/v1/appointment/slots`);
  return response.data;
};

export const getAppointmentByIdService = async (id: string) => {
  try {
    const response = await axios.get(
      `${baseURL}/appointments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const nurseRescheduleAppointmentService = async (data: any) => {
  const { cancel_reason, ...rest } = data;
  const response = await mainRequest.post("/api/v1/appointment/nurse/reschedule", rest);
  return response.data;
};

export const getAvailableTimeSlotsBySpecialtyService = async (specialty: string) => {
  const response = await mainRequest.get(`/api/v1/appointment/slots-by-specialty?specialty=${encodeURIComponent(specialty)}`);
  return response.data;
};
