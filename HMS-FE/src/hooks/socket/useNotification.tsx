// hooks/useSocket.ts
import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../services/socket";
import { useAuthStore } from "../../store/authStore";
import { getAllNotifications, markAllNotificationsAsRead } from "../../api/notification";
import type { NotificationItem } from "../../types/notification.type";

// const defaultNotifications: NotificationItem[] = [
//     { message: 'Bạn có tin nhắn mới', isSeen: false, navigate_url: "#" },
//     { message: 'Đơn hàng của bạn đã được giao', isSeen: false, navigate_url: "#" },
//     { message: 'Thông báo hệ thống lúc 10:00AM', isSeen: true, navigate_url: "#" },
// ];

export const useNotificationSocket = () => {
    const { user } = useAuthStore()
    const [open, setOpen] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unseenCount, setUnseenCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const limit = 15;
    const loadingRef = useRef(false);

    // Lấy notification theo page
    const fetchNotifications = async (pageNum = 1) => {
        const offset = (pageNum - 1) * limit;
        const data = await getAllNotifications(limit, offset);
        if (pageNum === 1) {
            setNotifications(data);
        } else {
            setNotifications((prev) => [...prev, ...data]);
        }
        if (data.length < limit) setHasMore(false);
        else setHasMore(true);
    };

    // Load more khi kéo xuống
    const loadMoreNotifications = async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        const nextPage = page + 1;
        await fetchNotifications(nextPage);
        setPage(nextPage);
        loadingRef.current = false;
    };

    const handleMarkNotificationAsRead = async () => {
        if (unseenCount !== 0) {
            const result = await markAllNotificationsAsRead()
            if (result.status === 200) {
                setUnseenCount(0);
            }
        }
    }

    useEffect(() => {
        if (!user || !user.id) return; // Check user existence
        if (open) {
            setPage(1);
            fetchNotifications(1);
            handleMarkNotificationAsRead();
        }
    }, [open, user]);

    useEffect(() => {
        if (!user || !user.id) return; // Check user existence
        const socket = getSocket(user.id);
        // Lắng nghe sự kiện "notification" từ socket
        const handleNotification = (notification: NotificationItem) => {
            console.log(notification)
            setNotifications((prev) => [notification, ...prev]);
            setUnseenCount((prev) => prev + 1);
        };
        socket.on("send_notification", handleNotification);
        return () => {
            socket.off("send_notification", handleNotification);
        };
    }, [user]);

    // Đếm số lượng thông báo chưa đọc khi user thay đổi hoặc khi mount
    useEffect(() => {
        if (!user || !user.id) return;
        const fetchUnseen = async () => {
            const data = await getAllNotifications();
            setUnseenCount(data.filter(n => !n.isSeen).length);
        };
        fetchUnseen();
    }, [user]);

    return { notifications, setNotifications, unseenCount, setUnseenCount, open, setOpen, loadMoreNotifications, hasMore };
};
