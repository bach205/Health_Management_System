import dayjs from 'dayjs';
import React from 'react';
import SearchStaffDropdown from '../../components/chat/SearchStaffDropdown';
import { useAuthStore } from '../../store/authStore';
import type { IConversation } from '../../types/chat.type';

interface ConversationListProps {
    conversations: IConversation[];
    selectedConversationId?: number;
    onSelectConversation: (conversation: IConversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedConversationId,
    onSelectConversation,
}) => {
    const { user } = useAuthStore();

    const getOtherParticipant = (conversation: IConversation) => {
        return conversation.participants.find(p => p.userId !== Number(user?.id))?.user;
    };

    const getLastMessageText = (conversation: IConversation) => {

        if (!conversation.last_message_at) return '';

        return ""
    };
    // Khi chọn user staff từ dropdown
    const handleSelectStaffConversation = (conversation: any) => {
        onSelectConversation(conversation);
    };

    return (
        <div className="w-full min-h-[100%] flex flex-col bg-white border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>

                {/* Search */}
                <div className="mt-3">
                    <div className="relative">

                        <div className="p-2">
                            <SearchStaffDropdown onSelectConversation={handleSelectStaffConversation} />
                        </div>

                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="mt-2">Chưa có cuộc trò chuyện nào</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {conversations.map((conversation) => {
                            const otherUser = getOtherParticipant(conversation);
                            const isSelected = conversation.id === selectedConversationId;

                            return (
                                <div
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(conversation)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={otherUser?.avatar || '/images/avatar-default.png'}
                                                alt={otherUser?.full_name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col flex-1 min-w-0 gap-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {otherUser?.full_name}
                                                </h3>

                                            </div>

                                            <div className='flex flex-col'>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {getLastMessageText(conversation)}
                                                </p>
                                                {conversation.last_message_at && (
                                                    <span className="text-xs text-gray-500">
                                                        {dayjs(conversation.last_message_at).format('HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unread Badge */}
                                        {conversation.unreadCount > 0 && (
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList; 