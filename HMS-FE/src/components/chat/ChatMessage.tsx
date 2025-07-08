import React from 'react';
import type { IMessage } from '../../types/chat.type';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';

interface ChatMessageProps {
    message: IMessage;
    onEdit: (messageId: number, newText: string) => void;
    onDelete: (messageId: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onEdit, onDelete }) => {
    const { user } = useAuthStore();
    const isOwnMessage = message.sendById === Number(user?.id);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editText, setEditText] = React.useState(message.text);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleEdit = () => {
        if (editText.trim() && editText !== message.text) {
            onEdit(message.id, editText);
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(message.id);
        setShowConfirm(false);
    };

    const renderMessageContent = () => {
        switch (message.message_type) {
            case 'image':
                return (
                    <div className="max-w-xs">
                        <img
                            src={message.file_url}
                            alt="Image"
                            className="rounded-lg max-w-full h-auto"
                        />
                        {message.text && (
                            <p className="mt-2 text-sm text-gray-700">{message.text}</p>
                        )}
                    </div>
                );
            case 'file':
                return (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {message.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {message.file_type}
                            </p>
                        </div>
                        <a
                            href={message.file_url}
                            download={message.file_name}
                            className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                );
            default:
                return (
                    <div className="text-sm">
                        {isEditing ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                                    autoFocus
                                />
                                <button
                                    onClick={handleEdit}
                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <img
                        src={message.sendBy.avatar || '/images/avatar-default.png'}
                        alt={message.sendBy.full_name}
                        className="w-8 h-8 rounded-full"
                    />
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-lg ${isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}>
                        {renderMessageContent()}
                    </div>

                    {/* Message Info */}
                    <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                        <span>{dayjs(message.created_at).format('HH:mm')}</span>
                        {message.is_read && isOwnMessage && (
                            <span className="text-blue-500">✓✓</span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {isOwnMessage && !isEditing && (
                        <div className="flex items-center space-x-1 mt-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Sửa
                            </button>
                            <button
                                onClick={handleDelete}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Modal xác nhận xóa */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)]">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                        <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
                        <p className="mb-4">Bạn có chắc chắn muốn xóa tin nhắn này không?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMessage; 