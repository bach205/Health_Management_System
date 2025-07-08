import React from 'react';
import chatService from '../../services/chat.service';

interface ChatNotificationBadgeProps {
    className?: string;
}

const ChatNotificationBadge: React.FC<ChatNotificationBadgeProps> = ({ className = '' }) => {
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        loadUnreadCount();

        // Poll for new unread messages every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const count = await chatService.getTotalUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    if (unreadCount === 0) {
        return null;
    }

    return (
        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    );
};

export default ChatNotificationBadge; 