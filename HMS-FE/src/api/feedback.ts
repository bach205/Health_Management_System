import mainRequest from './mainRequest';

const BASE_URL = '/api/v1/feedback';

export const getDoctorAverageRating = async (doctorId: number) => {
    const res = await mainRequest.get(`${BASE_URL}/doctor/${doctorId}/average-rating`);
    return res.data;
};

export const getDoctorComments = async (doctorId: number, limit = 15, offset = 0, sortBy = "newest", star?: number) => {
    let url = `${BASE_URL}/doctor/${doctorId}/comments?limit=${limit}&offset=${offset}&sortBy=${sortBy}`;
    if (star) url += `&star=${star}`;
    const res = await mainRequest.get(url);
    return res.data;
};

export const getFeedbackByAppointmentId = async (appointmentId: number) => {
    const res = await mainRequest.get(`/api/v1/feedback/appointment/${appointmentId}`);
    return res.data;
};

export const createFeedback = async (data: { appointment_id: number; comment: string; rating: number }) => {
    const res = await mainRequest.post(`/api/v1/feedback`, data);
    return res.data;
};

export const updateFeedback = async (appointmentId: number, data: { comment: string; rating: number }) => {
    const res = await mainRequest.put(`/api/v1/feedback/appointment/${appointmentId}`, data);
    return res.data;
};

export const deleteFeedback = async (appointmentId: number) => {
    const res = await mainRequest.delete(`/api/v1/feedback/appointment/${appointmentId}`);
    return res.data;
}; 