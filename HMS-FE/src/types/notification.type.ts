export interface NotificationItem {
    id: number;
    message: string;
    isSeen: boolean;
    navigate_url: string;
    created_at: string; // hoặc Date nếu bạn dùng Date object trong code
    updated_at: string; // hoặc Date
    userId: number;
}
export interface ListNotificationProps {
    modalRef: React.RefObject<HTMLDivElement>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    notifications: NotificationItem[];
}
