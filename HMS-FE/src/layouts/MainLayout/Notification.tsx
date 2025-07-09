import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationSocket } from '../../hooks/socket/useNotification';
import type { ListNotificationProps } from '../../types/notification.type';

const ListNotification = ({
    modalRef,
    setOpen,
    notifications,
}: ListNotificationProps) => {
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
            <ul className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                    <li className="text-center text-gray-400 py-4">
                        Không có thông báo nào
                    </li>
                ) : (
                    notifications.map((item, index) => (
                        <li
                            key={index}
                            className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded hover:bg-gray-100 transition"
                        >
                            {!item.isSeen && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 inline-block"></span>
                            )}
                            <span>{item.message}</span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default function Notification() {
    const { notifications, setNotifications, unseenCount, setUnseenCount, open, setOpen } = useNotificationSocket()

    const modalRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);


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
                    modalRef={modalRef}
                    setOpen={setOpen}
                    notifications={notifications}
                />
            )}
        </div>
    );
}
