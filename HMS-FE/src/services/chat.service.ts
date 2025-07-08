import mainRequest from '../api/mainRequest';
import type {
    IMessage,
    IConversation,
    ISendMessageData,
    IUpdateMessageData,
    IChatResponse
} from '../types/chat.type';
const BASE_URL = `/api/v1`

class ChatService {
    // Lấy danh sách conversations
    async getConversations(): Promise<IConversation[]> {
        try {
            const response = await mainRequest.get(`${BASE_URL}/conversation`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    // Lấy tin nhắn theo conversation
    async getMessagesByConversationId(
        conversationId: number,
        page: number = 1,
        limit: number = 20
    ): Promise<IMessage[]> {
        try {
            const response = await mainRequest.get(`${BASE_URL}/chat/conversation/${conversationId}`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    // Gửi tin nhắn mới
    async sendMessage(data: ISendMessageData): Promise<IMessage> {
        try {
            const response = await mainRequest.post('/chats', data);
            return response.data.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Cập nhật tin nhắn
    async updateMessage(messageId: number, data: IUpdateMessageData): Promise<IMessage> {
        try {
            const response = await mainRequest.put(`/chats/${messageId}`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }

    // Xóa tin nhắn
    async deleteMessage(messageId: number): Promise<{ message: string }> {
        try {
            const response = await mainRequest.delete(`/chats/${messageId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    // Đánh dấu tin nhắn đã đọc
    async markMessageAsRead(messageId: number): Promise<IMessage> {
        try {
            const response = await mainRequest.put(`${BASE_URL}/chat/${messageId}/read`);
            return response.data.data;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    // Đánh dấu tất cả tin nhắn trong conversation đã đọc
    async markConversationAsRead(conversationId: number): Promise<{ message: string }> {
        try {
            const response = await mainRequest.put(`${BASE_URL}/chat/conversation/${conversationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking conversation as read:', error);
            throw error;
        }
    }

    // Lấy số tin nhắn chưa đọc theo conversation
    async getUnreadCountByConversation(conversationId: number): Promise<number> {
        try {
            const response = await mainRequest.get(`${BASE_URL}/conversation/${conversationId}/unread-count`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }

    // Lấy tổng số tin nhắn chưa đọc
    async getTotalUnreadCount(): Promise<number> {
        try {
            const response = await mainRequest.get(`${BASE_URL}/chats/unread-count`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching total unread count:', error);
            throw error;
        }
    }

    // Tìm kiếm tin nhắn
    async searchMessages(conversationId: number, searchTerm: string): Promise<IMessage[]> {
        try {
            const response = await mainRequest.get(`${BASE_URL}/conversation/${conversationId}/search`, {
                params: { q: searchTerm }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    }

    // Lấy tin nhắn chưa đọc
    async getUnreadMessages(): Promise<IMessage[]> {
        try {
            const response = await mainRequest.get('/chats/unread');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            throw error;
        }
    }
}

export default new ChatService(); 