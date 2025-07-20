import React from 'react';
import type { IMessage } from '../../types/chat.type';
import { useAuthStore } from '../../store/authStore';
import dayjs from 'dayjs';
import fileStreamService from '../../services/fileStream.service';

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
    const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
    const [isLoadingBlob, setIsLoadingBlob] = React.useState(false);

    React.useEffect(() => {
        if (fileStreamService.isFileMessage(message) && message.file_url) {
            setIsLoadingBlob(true);
            fileStreamService.getBlobUrl(message.file_url)
                .then(url => setBlobUrl(url))
                .catch(error => console.error('Error loading blob URL:', error))
                .finally(() => setIsLoadingBlob(false));
        }

        return () => {
            if (blobUrl) {
                fileStreamService.revokeBlobUrl(message.file_url!);
            }
        };
    }, [message.file_url, message.message_type]);

    const handleEdit = () => {
        if (editText.trim() && editText !== message.text) {
            onEdit(message.id, editText);
        }
        setIsEditing(false);
    };

    const confirmDelete = () => {
        onDelete(message.id);
        setShowConfirm(false);
    };

    const openFileInNewWindow = () => {
        if (blobUrl) window.open(blobUrl, '_blank');
    };

    const openFileDownload = () => {
        if (blobUrl) {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = message.file_name || 'download';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const renderMessageContent = () => {
        switch (message.message_type) {
            case 'image':
                return (
                    <div className="max-w-xs">
                        {isLoadingBlob ? (
                            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
                                onClick={openFileInNewWindow}
                                title="Click để xem ảnh trong cửa sổ mới">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : blobUrl ? (
                            <img
                                src={blobUrl}
                                alt="Image"
                                className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={openFileInNewWindow}
                                title="Click để xem ảnh trong cửa sổ mới"
                                onError={() => {
                                    console.error('Error loading image');
                                    setBlobUrl(null);
                                }}
                            />
                        ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Lỗi tải ảnh</span>
                            </div>
                        )}
                        {message.text && (
                            <p className="mt-2 text-sm text-gray-700">{message.text}</p>
                        )}
                    </div>
                );
            case 'file':
                return (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <div className="flex-1 flex items-center space-x-2 cursor-pointer hover:bg-blue-100 transition-colors rounded p-1"
                            onClick={openFileDownload}
                            title="Click để tải xuống file">
                            <div className="flex-shrink-0">
                                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {message.file_name}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-sm px-4 py-2">
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
                                <button onClick={handleEdit} className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">✓</button>
                                <button onClick={() => setIsEditing(false)} className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">✕</button>
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
            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                {/* Message Content */}
                <div className={`rounded-lg ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {renderMessageContent()}
                </div>

                {/* Sender Name */}
                <div className="mt-1 text-xs text-gray-500">
                    {isOwnMessage ? '(Bạn)' : message.sendBy.full_name}
                </div>

                {/* Message Info */}
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
                    <span>{dayjs(message.created_at).format('HH:mm')}</span>
                    {message.is_read && isOwnMessage && (
                        <span className="text-blue-500">✓✓</span>
                    )}
                </div>

                {/* Action Buttons */}
                {isOwnMessage && !isEditing && (
                    <div className="flex items-center space-x-1 mt-1">
                        {message.message_type === 'text' && (
                            <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:text-gray-700">
                                Sửa
                            </button>
                        )}
                        <button onClick={() => setShowConfirm(true)} className="text-xs text-red-500 hover:text-red-700">
                            Xóa
                        </button>
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)]">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                        <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
                        <p className="mb-4">Bạn có chắc chắn muốn xóa tin nhắn này không?</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowConfirm(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                            <button onClick={confirmDelete} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
