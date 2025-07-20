import React from 'react';
import { useAuthStore } from '../../store/authStore';
import type { IConversation, IMessage, ISendMessageData } from '../../types/chat.type';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';

interface ChatWindowProps {
    conversation: IConversation;
    messages: IMessage[];
    onSendMessage: (data: ISendMessageData) => void;
    onEditMessage: (messageId: number, newText: string) => void;
    onDeleteMessage: (messageId: number) => void;
    isLoading?: boolean;
    fetchMoreMessages: (message_id: number, limit: number, page: number) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    conversation,
    messages,
    onSendMessage,
    onEditMessage,
    onDeleteMessage,
    fetchMoreMessages,
    isLoading = false
}) => {
    const { user } = useAuthStore();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const messagesContainerRef = React.useRef<HTMLDivElement>(null);
    const [page, setPage] = React.useState(1);
    const LIMIT = 20;

    const filteredMessages = React.useMemo(() => {
        if (!searchTerm) return messages;
        return messages.filter(message =>
            message.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [messages, searchTerm]);
    // Auto scroll to bottom when new messages arrive
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 150);
        return () => clearTimeout(timeout);
    }, [conversation]);

    const getOtherParticipant = () => {
        if (!conversation) return null;
        return conversation.participants.find(p => p.userId !== Number(user?.id))?.user;
    };

    const handleScroll = () => {
        if (messagesContainerRef.current && messagesContainerRef.current.scrollTop === 0) {
            setPage(prev => prev + 1);
        }
    };

    React.useEffect(() => {
        if (page === 1) return;
        const fetch = async () => {
            const oldHeight = messagesContainerRef.current?.scrollHeight || 0;
            await fetchMoreMessages(conversation.id, page, LIMIT);
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - oldHeight;
                }
            }, 0);
        };
        fetch();
    }, [page]);

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chọn cuộc trò chuyện</h3>
                    <p className="mt-1 text-sm text-gray-500">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                </div>
            </div>
        );
    }

    const otherUser = getOtherParticipant();
    const getParticipantsExceptSelf = () =>
        conversation.participants
            .filter(p => p.userId !== Number(user?.id))
            .map(p => p.user);

    return (
        <div className="flex-1 flex flex-col bg-white  min-h-[100%]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    {conversation.type === 'group' ? (
                        <>
                            <div className="flex -space-x-2">
                                {getParticipantsExceptSelf().slice(0, 3).map(u => (
                                    <img
                                        key={u.id}
                                        src={u.avatar || '/images/avatar-default.png'}
                                        alt={u.full_name}
                                        className="w-8 h-8 rounded-full border-2 border-white"
                                    />
                                ))}
                                {getParticipantsExceptSelf().length > 3 && (
                                    <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold border-2 border-white">
                                        +{getParticipantsExceptSelf().length - 3}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {conversation.name || 'Nhóm chat'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {getParticipantsExceptSelf().map(u => u.full_name).join(', ')}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <img
                                src={otherUser?.avatar || '/images/avatar-default.png'}
                                alt={otherUser?.full_name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {otherUser?.full_name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {otherUser?.email}
                                </p>
                            </div>
                        </>
                    )}
                </div>


                {/* Search Messages */}
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin nhắn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-1 pl-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg
                            className="absolute left-2 top-1.5 h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="p-4 bg-gray-50 overflow-y-auto h-[27.5rem]" ref={messagesContainerRef} onScroll={handleScroll}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredMessages?.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            {searchTerm ? (
                                <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <p className="mt-2">Không tìm thấy tin nhắn nào</p>
                                </>
                            ) : (
                                <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="mt-2">Chưa có tin nhắn nào</p>
                                    <p className="text-sm">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên</p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onEdit={onEditMessage}
                                onDelete={onDeleteMessage}
                            />
                        ))}
                        <div ref={messagesEndRef} ></div>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <MessageInput
                onSendMessage={onSendMessage}
                conversationId={conversation.id}
                toId={conversation.type === 'direct' ? otherUser?.id : undefined}
                disabled={isLoading}
            />
        </div>
    );
};

export default ChatWindow; 