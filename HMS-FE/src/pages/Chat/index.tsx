import React from 'react';
import ChatWindow from '../../components/chat/ChatWindow';
import ConversationList from '../../components/chat/ConversationList';
import { useChat } from '../../hooks/useChat';


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
        fetchMoreMessages
    } = useChat();


    return (
        <div className="h-[85vh] flex bg-gray-100">
            {/* Conversation List */}
            <div className="w-80 flex-shrink-0">
                <ConversationList
                    conversations={conversations}
                    selectedConversationId={selectedConversation?.id}
                    onSelectConversation={selectConversation}
                />
            </div>

            {/* Chat Window */}
            <div className="flex-1 h-full">
                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    onSendMessage={sendMessage}
                    onEditMessage={editMessage}
                    onDeleteMessage={deleteMessage}
                    isLoading={isLoadingMessages}
                    fetchMoreMessages={fetchMoreMessages}
                />
            </div>
        </div>
    );
};

export default ChatPage; 