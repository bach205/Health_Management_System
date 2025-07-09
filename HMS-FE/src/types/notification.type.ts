export interface NotificationItem {
    message: string;
    isSeen: boolean;
    navigate_url: string;
}

export interface ListNotificationProps {
    modalRef: React.RefObject<HTMLDivElement>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    notifications: NotificationItem[];
}
