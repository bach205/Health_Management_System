import mainRequest from '../api/mainRequest';
import type { IUser } from '../types/chat.type';
const BASE_URL = "/api/v1"
export const searchStaff = async (query: string): Promise<IUser[]> => {
    const res = await mainRequest.get(`${BASE_URL}/user/search-staff`, { params: { query } });
    return res.data.data;
}; 