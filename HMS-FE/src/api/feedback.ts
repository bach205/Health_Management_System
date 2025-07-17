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

export const createFeedback = async (data: { doctorId: number; content: string; rating: number }) => {
    const res = await mainRequest.post(BASE_URL, data);
    return res.data;
};

export const updateFeedback = async (id: number, data: { content: string; rating: number }) => {
    const res = await mainRequest.put(`${BASE_URL}/${id}`, data);
    return res.data;
};

export const deleteFeedback = async (id: number) => {
    const res = await mainRequest.delete(`${BASE_URL}/${id}`);
    return res.data;
}; 