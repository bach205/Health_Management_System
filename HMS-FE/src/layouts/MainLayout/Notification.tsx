import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationSocket } from '../../hooks/socket/useNotification';
import type { ListNotificationProps } from '../../types/notification.type';
import type { NotificationItem } from '../../types/notification.type';
import { deleteNotification } from '../../api/notification';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';

const ListNotification = ({
    modalRef,
    setOpen,
    notifications,
    setNotifications,
    loadMoreNotifications,
    hasMore,
    navigate
}: ListNotificationProps & { setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>, loadMoreNotifications: () => void, hasMore: boolean, navigate: (url: string) => void }) => {
    const listRef = useRef<HTMLUListElement>(null);
    const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);

    // Gọi loadMore khi scroll tới cuối
    const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && hasMore) {
            loadMoreNotifications();
        }
    };

    return (
        <div
            ref={modalRef}
            className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4 z-50 border"
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Thông báo</h3>
                <button
                    className="text-sm text-gray-500 hover:text-black cursor-pointer"
                    onClick={() => setOpen(false)}
                    aria-label="Đóng"
                >
                    Đóng
                </button>
            </div>
            <ul
                ref={listRef}
                className="max-h-60 overflow-y-auto space-y-2"
                onScroll={handleScroll}
            >
                {notifications.length === 0 ? (
                    <li className="text-center text-gray-400 py-4">
                        Không có thông báo nào
                    </li>
                ) : (
                    notifications.map((item, index) => (
                        <li
                            key={index}
                            className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded hover:bg-gray-100 transition cursor-pointer relative"
                            onClick={() => { if (item.navigate_url) navigate(item.navigate_url); }}
                        >
                            {!item.isSeen && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 inline-block"></span>
                            )}
                            <span className="flex-1">
                                {item.message}
                                {item.created_at && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(item.created_at).toLocaleString('vi-VN', { hour12: false })}
                                    </div>
                                )}
                            </span>
                            <div className="relative ml-2">
                                <button
                                    className="p-1 rounded hover:bg-gray-200"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setOpenMenuIdx(openMenuIdx === index ? null : index);
                                    }}
                                    aria-label="Tùy chọn thông báo"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenuIdx === index && (
                                    <div className="absolute right-0 top-6 bg-white border rounded shadow z-10 min-w-[80px]">
                                        <button
                                            className="block w-full text-left px-3 py-1 text-xs text-red-500 hover:bg-gray-100"
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    await deleteNotification(item.id);
                                                    setNotifications((prev) => prev.filter(n => n.id !== item.id));
                                                    setOpenMenuIdx(null);
                                                } catch (err) {
                                                    alert('Xóa thông báo thất bại!');
                                                }
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))
                )}
                {hasMore && (
                    <li className="text-center text-gray-400 py-2">Đang tải thêm...</li>
                )}
            </ul>
        </div>
    );
};

export default function Notification() {
    const { notifications, setNotifications, unseenCount, setUnseenCount, open, setOpen, loadMoreNotifications, hasMore } = useNotificationSocket()

    const modalRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    // Đóng modal khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                bellRef.current &&
                !bellRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative inline-block">
            <button
                ref={bellRef}
                className="p-2 rounded-full hover:bg-gray-200 transition relative cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Thông báo"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                {unseenCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {unseenCount}
                    </span>
                )}
            </button>
            {open && (
                <ListNotification
                    modalRef={modalRef as React.RefObject<HTMLDivElement>}
                    setOpen={setOpen}
                    notifications={notifications}
                    setNotifications={setNotifications}
                    loadMoreNotifications={loadMoreNotifications}
                    hasMore={hasMore}
                    navigate={navigate}
                />
            )}
        </div>
    );
}
