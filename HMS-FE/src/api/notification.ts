import axios from "./mainRequest";
import type { NotificationItem } from '../types/notification.type';

const BASE_URL = "api/v1/notification";

export const markAllNotificationsAsRead = async () => {
    return await axios.patch(`${BASE_URL}/read_all`);
};

export const getAllNotifications = async (limit = 15, offset = 0): Promise<NotificationItem[]> => {
    const res = await axios.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return res.data;
};
