import React, { useState } from 'react';
import CreateGroupModal from '../../components/chat/CreateGroupModal';
import ChatWindow from '../../components/chat/ChatWindow';
import ConversationList from '../../components/chat/ConversationList';
import { useChat } from '../../hooks/socket/useChat';

const ChatPage: React.FC = () => {
    const {
        conversations,
        selectedConversation,
        messages,
        isLoading,
        isLoadingMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        selectConversation,
        fetchMoreMessages,
        loadConversations
    } = useChat();

    const [showGroupModal, setShowGroupModal] = useState(false);

    const openCreateGroupModal = () => setShowGroupModal(true);
    const closeCreateGroupModal = () => setShowGroupModal(false);

    return (
        <>
            <div className="h-[85vh] flex bg-gray-100">
                {/* Conversation List */}
                <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-300">
                    {/* 👉 Header bên trái */}
                    <div className="p-4 flex items-center justify-between border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Tin nhắn</h2>
                        <button
                            onClick={openCreateGroupModal}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            Tạo nhóm
                        </button>
                    </div>

                    {/* 👉 Danh sách cuộc trò chuyện */}
                    <div className="flex-1 overflow-y-auto">
                        <ConversationList
                            conversations={conversations}
                            selectedConversationId={selectedConversation?.id}
                            onSelectConversation={selectConversation}
                        />
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 h-full">
                    {selectedConversation && (
                        <ChatWindow
                            conversation={selectedConversation}
                            messages={messages}
                            onSendMessage={sendMessage}
                            onEditMessage={editMessage}
                            onDeleteMessage={deleteMessage}
                            isLoading={isLoadingMessages}
                            fetchMoreMessages={fetchMoreMessages}
                        />
                    )}
                </div>
            </div>

            {/* Create Group Modal */}
            {showGroupModal && (
                <CreateGroupModal
                    onClose={closeCreateGroupModal}
                    onCreated={loadConversations}
                />
            )}
        </>
    );
};

export default ChatPage;
