// hooks/useSocket.ts
import { useEffect, useState } from "react";
import { getSocket } from "../../services/socket";
import { useAuthStore } from "../../store/authStore";
import type { NotificationItem } from "../../types/notification.type";

const defaultNotifications: NotificationItem[] = [
    { message: 'Bạn có tin nhắn mới', isSeen: false, navigate_url: "#" },
    { message: 'Đơn hàng của bạn đã được giao', isSeen: false, navigate_url: "#" },
    { message: 'Thông báo hệ thống lúc 10:00AM', isSeen: true, navigate_url: "#" },
];

export const useNotificationSocket = () => {
    const { user } = useAuthStore()
    const [open, setOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unseenCount, setUnseenCount] = useState<number>(0);

    useEffect(() => {
        if (open) {
            setNotifications(defaultNotifications);
            //mark as read
        }
    }, [open])

    useEffect(() => {
        if (!user || !user.id) return; // Check user existence
        const socket = getSocket(user.id);
        // Lắng nghe sự kiện "notification" từ socket
        const handleNotification = (notification: NotificationItem) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnseenCount((prev) => prev + 1);
            //if open thi se call api mark as read luon, append notification vao notification
        };
        socket.on("send_notification", handleNotification);
        return () => {
            socket.off("send_notification", handleNotification);
        };
    }, [open, user]);

    return { notifications, setNotifications, unseenCount, setUnseenCount, open, setOpen };
};
