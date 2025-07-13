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
    const [showMenu, setShowMenu] = React.useState(false);
    const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
    const [isLoadingBlob, setIsLoadingBlob] = React.useState(false);

    // Load blob URL khi message là file/image
    React.useEffect(() => {
        if (fileStreamService.isFileMessage(message) && message.file_url) {
            setIsLoadingBlob(true);
            fileStreamService.getBlobUrl(message.file_url)
                .then(url => {
                    setBlobUrl(url);
                })
                .catch(error => {
                    console.error('Error loading blob URL:', error);
                })
                .finally(() => {
                    setIsLoadingBlob(false);
                });
        }

        // Cleanup khi component unmount
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

    const handleDelete = () => {
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(message.id);
        setShowConfirm(false);
    };

    // Mở file/ảnh trong window mới
    const openFileInNewWindow = () => {
        if (blobUrl) {
            window.open(blobUrl, '_blank');
        }
    };

    // Kiểm tra xem message có thể edit không (chỉ text message)
    const canEdit = message.message_type === 'text';

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
                            onClick={openFileInNewWindow}
                            title="Click để mở file trong cửa sổ mới">
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
                            <div className="flex-shrink-0 text-blue-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        {/* Nút download */}
                        {blobUrl && (
                            <a
                                href={blobUrl}
                                download={message.file_name}
                                className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                title="Tải xuống file"
                                onClick={(e) => e.stopPropagation()} // Ngăn không cho trigger openFileInNewWindow
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </a>
                        )}
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
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`relative max-w-[80%] px-4 py-2 rounded-lg ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                {renderMessageContent()}
                {/* Menu ba chấm (chỉ cho tin nhắn của mình) */}
                {isOwnMessage && !isEditing && (
                    <div className="absolute -left-6 top-1">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                            </svg>
                        </button>

                        {showMenu && (
                            <div className="absolute -left-28 top-6 w-28 bg-white border rounded shadow-md z-50">
                                {/* Chỉ hiển thị nút Edit cho text message */}
                                {canEdit && (
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setShowMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleDelete();
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Xóa
                                </button>
                            </div>
                        )}
                    </div>
                )}
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