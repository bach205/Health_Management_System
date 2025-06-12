import axios from 'axios';
// import { API_URL } from '../config';

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

const appointmentService = {
  createAppointment: async (appointmentData: AppointmentData) => {
    try {
      const response = await axios.post(`/api/appointments`, appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDoctors: async () => {
    try {
      const response = await axios.get(`/api/doctors`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAvailableTimeSlots: async (doctorId: string, date: string) => {
    try {
      const response = await axios.get(
        `/api/appointments/available-slots?doctorId=${doctorId}&date=${date}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // New methods for nurse appointment management
  getNurseAppointments: async (filters: AppointmentFilters) => {
    try {
      const response = await axios.get('/api/nurse/appointments', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  confirmAppointment: async (appointmentId: string) => {
    try {
      const response = await axios.put(`/api/nurse/appointments/${appointmentId}/confirm`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectAppointment: async (appointmentId: string, reason: string) => {
    try {
      const response = await axios.put(`/api/nurse/appointments/${appointmentId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default appointmentService; 