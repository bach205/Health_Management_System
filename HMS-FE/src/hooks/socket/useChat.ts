import { useState, useEffect, useCallback } from 'react';
import type { IMessage, IConversation, ISendMessageData } from '../../types/chat.type';
import chatService from '../../services/chat.service';
import fileStreamService from '../../services/fileStream.service';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { getSocket } from '../../services/socket';

export const useChat = () => {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<IConversation | undefined>();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Kết nối socket và lắng nghe sự kiện
    useEffect(() => {
        if (!user) return;
        const socket = getSocket(user.id);
        // Lắng nghe tin nhắn mới
        socket.on('new_message', async (message: IMessage) => {
            setMessages((prev) => {
                // Nếu message thuộc conversation đang mở thì thêm vào
                if (selectedConversation && message.conversationId === selectedConversation.id) {
                    // Gọi API đánh dấu đã đọc luôn
                    chatService.markConversationAsRead(message.conversationId);

                    // Nếu là file/image message, preload blob URL
                    if (fileStreamService.isFileMessage(message) && message.file_url) {
                        // Preload blob URL trong background
                        fileStreamService.getBlobUrl(message.file_url).catch(error => {
                            console.error('Error preloading blob URL:', error);
                        });
                    }

                    return [...prev, message];
                }
                return [...prev]
            })
        });

        // Lắng nghe tin nhắn bị sửa
        socket.on('message_updated', (updated: IMessage) => {
            setMessages((prev) => prev.map((msg) => (msg.id === updated.id ? updated : msg)));
        });
        // Lắng nghe tin nhắn bị xóa
        socket.on('message_deleted', (id: number) => {
            setMessages((prev) => prev.filter((msg) => (msg.id !== id)));
        });

        return () => {
            socket.off('new_message');
            socket.off('message_updated');
            socket.off('message_deleted');
        };
        // eslint-disable-next-line
    }, [user, selectedConversation]);

    // Lấy danh sách conversation ban đầu
    const loadConversations = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            toast.error('Không thể tải danh sách cuộc trò chuyện');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Lấy messages ban đầu của conversation
    const loadMessages = useCallback(async (conversationId: number) => {
        try {
            setIsLoadingMessages(true);
            const data = await chatService.getMessagesByConversationId(conversationId);
            if (data) {
                setMessages(data);

                // Preload blob URLs cho tất cả file/image messages
                data.forEach(message => {
                    if (fileStreamService.isFileMessage(message) && message.file_url) {
                        fileStreamService.getBlobUrl(message.file_url).catch(error => {
                            console.error('Error preloading blob URL:', error);
                        });
                    }
                });
            }
            // Đánh dấu đã đọc
            await chatService.markConversationAsRead(conversationId);

            // Update unread count in conversations list
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                )
            );
        } catch (error) {
            toast.error('Không thể tải tin nhắn');
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // Gửi tin nhắn qua socket
    const sendMessage = useCallback((data: ISendMessageData) => {
        if (!user || !selectedConversation) return;

        const socket = getSocket(user.id);

        // 🛠️ nếu là chat 1-1 thì thêm toId
        if (selectedConversation.type === 'direct') {
            const other = selectedConversation.participants.find(p => Number(p.id) !== Number(user.id));
            if (!other) return;
            data.toId = other.id;
        }

        socket.emit('send_message', data);
    }, [user, selectedConversation]);


    // Sửa tin nhắn qua socket
    const editMessage = useCallback((messageId: number, newText: string) => {
        if (!user) return;
        const socket = getSocket(user.id);
        socket.emit('edit_message', { messageId, text: newText });
    }, [user]);

    // Xóa tin nhắn qua socket
    const deleteMessage = useCallback((messageId: number) => {
        if (!user) return;
        const socket = getSocket(user.id);
        socket.emit('delete_message', { messageId });
    }, [user]);

    // Chọn conversation
    const selectConversation = (conversation: IConversation) => {
        setSelectedConversation(conversation);
    };

    // Tìm kiếm tin nhắn (vẫn dùng HTTP API)
    const searchMessages = useCallback(async (conversationId: number, searchTerm: string) => {
        try {
            const results = await chatService.searchMessages(conversationId, searchTerm);
            return results;
        } catch (error) {
            toast.error('Không thể tìm kiếm tin nhắn');
            return [];
        }
    }, []);

    // Fetch more messages for lazy load (pagination)
    const fetchMoreMessages = async (conversationId: number, limit: number, page: number): Promise<IMessage[]> => {
        try {
            const newMessages = await chatService.getMessagesByConversationId(conversationId, limit, page);
            setMessages(prev => [...newMessages, ...prev]);
            return newMessages;
        } catch (error) {
            toast.error('Không thể tải thêm tin nhắn');
            return [];
        }
    };

    // Load initial data
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user, loadConversations, messages]);

    // Load messages khi chọn conversation
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation, loadMessages]);

    return {
        conversations,
        selectedConversation,
        messages,
        isLoading,
        isLoadingMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        selectConversation,
        searchMessages,
        loadConversations,
        loadMessages,
        fetchMoreMessages
    };
}; 