import axios from "./mainRequest";
import type { NotificationItem } from '../types/notification.type';

const BASE_URL = "api/v1/notification";

interface NotificationData {
    message: string;
    isSeen: boolean;
    userId: number;
    navigate_url: string;
}

export const PushANotification = async (data: NotificationData) => {
    const response = await axios.post(BASE_URL, data);
    return response
};

export const markAllNotificationsAsRead = async () => {
    return await axios.patch(`${BASE_URL}/read_all`);
};

export const getAllNotifications = async (limit = 15, offset = 0): Promise<NotificationItem[]> => {
    const res = await axios.get(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    return res.data;
};

export const deleteNotification = async (id: number) => {
    return await axios.delete(`${BASE_URL}/${id}`);
};
