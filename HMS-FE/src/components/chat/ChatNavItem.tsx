import React from 'react';
import { Link } from 'react-router-dom';
import ChatNotificationBadge from './ChatNotificationBadge';

interface ChatNavItemProps {
    className?: string;
}

const ChatNavItem: React.FC<ChatNavItemProps> = ({ className = '' }) => {
    return (
        <Link
            to="/chat"
            className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${className}`}
        >
            <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <ChatNotificationBadge className="absolute -top-1 -right-1" />
            </div>
            <span>Tin nhắn</span>
        </Link>
    );
};

export default ChatNavItem; 