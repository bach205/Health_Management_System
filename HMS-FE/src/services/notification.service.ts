import mainRequest from '../api/mainRequest';
import type { NotificationItem } from '../types/notification.type';
const BASE_URL = `/api/v1`

class NotificationService {
    // Lấy danh sách conversations
    async getAllNotifications(): Promise<NotificationItem[]> {
        try {
            const response = await mainRequest.get(`${BASE_URL}/conversation`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

}
export default new NotificationService(); 