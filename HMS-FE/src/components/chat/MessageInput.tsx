import React from 'react';
import type { ISendMessageData } from '../../types/chat.type';

interface MessageInputProps {
    onSendMessage: (data: ISendMessageData) => void;
    conversationId: number;
    toId: number;
    disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    conversationId,
    toId,
    disabled = false
}) => {
    const [message, setMessage] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);
    const [pendingFiles, setPendingFiles] = React.useState<Array<{ file: File, preview: string, meta?: { file_url: string, file_name: string, file_type: string } }>>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // // Cleanup: xóa file khi component unmount
    // React.useEffect(() => {
    //     return () => {
    //         console.log(1)
    //         // Xóa tất cả file đã upload nhưng chưa gửi khi component unmount
    //         pendingFiles.forEach(async (pf) => {
    //             if (pf.meta) {
    //                 try {
    //                     const chatService = (await import('../../services/chat.service')).default;
    //                     await chatService.deleteFile(pf.meta.file_url);
    //                 } catch (err) {
    //                     // ignore
    //                 }
    //             }
    //             if (pf.preview) URL.revokeObjectURL(pf.preview);
    //         });

    //     };
    // }, [pendingFiles]);

    const handleSendMessage = async () => {
        if (disabled) return;
        // Gửi text nếu có
        if (message.trim()) {
            const messageData: ISendMessageData = {
                text: message.trim(),
                toId,
                conversationId,
                message_type: 'text'
            };
            onSendMessage(messageData);
        }
        // Gửi từng file (mỗi file là 1 message)
        for (const pf of pendingFiles) {
            if (pf.meta) {
                const messageData: ISendMessageData = {
                    text: '',
                    file_url: pf.meta.file_url,
                    file_name: pf.meta.file_name,
                    file_type: pf.meta.file_type,
                    toId,
                    conversationId,
                    message_type: pf.meta.file_type.startsWith('image/') ? 'image' : 'file'
                };
                onSendMessage(messageData);
            }
        }
        setMessage('');
        setPendingFiles([]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const chatService = (await import('../../services/chat.service')).default;
        const fileArr = Array.from(files);
        try {
            const metas = await chatService.uploadFiles(fileArr);
            console.log(metas)
            console.log(fileArr)
            const newPendingFiles = fileArr.map((file, i) => ({ file, preview: URL.createObjectURL(file), meta: metas[i] }));
            setPendingFiles(prev => [...prev, ...newPendingFiles]);
        } catch (err) {
            alert('Lỗi upload file!');
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = async (idx: number) => {
        const pf = pendingFiles[idx];
        if (!pf) return;
        setPendingFiles(prev => prev.filter((_, i) => i !== idx));
        if (pf.meta) {
            try {
                const chatService = (await import('../../services/chat.service')).default;
                await chatService.deleteFile(pf.meta.file_url);
            } catch (err) {
                // ignore
            }
        }
        // Thu hồi preview url
        if (pf.preview) URL.revokeObjectURL(pf.preview);
    };

    const handleFileUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = '*/*';
            fileInputRef.current.click();
        }
    };

    return (
        <div className="border-t border-gray-200 p-4 bg-white">
            {/* File Upload Input (Hidden) */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="*/*"
                multiple
            />

            {/* Preview files */}
            {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {pendingFiles.map((pf, idx) => pf && (
                        <div key={idx} className="relative group border rounded p-1 flex flex-col items-center w-20">
                            {pf.meta?.file_type?.startsWith('image/') ? (
                                <img src={pf.preview} alt={pf.meta.file_name} className="w-16 h-16 object-cover rounded" />
                            ) : (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <span
                                className="block mt-1 text-xs text-gray-700 max-w-[4.5rem] truncate text-center"
                                title={pf.meta?.file_name || pf.file.name}
                            >
                                {pf.meta?.file_name || pf.file.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100"
                                title="Xóa file"
                            >×</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Message Input */}
            <div className="flex space-x-2 items-center">
                {/* Attachment Buttons */}
                <div className="flex items-center space-x-1">
                    <button
                        type="button"
                        onClick={handleFileUploadClick}
                        disabled={disabled}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Gửi file hoặc hình ảnh"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                </div>

                {/* Text Input */}
                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        disabled={disabled}
                        placeholder="Nhập tin nhắn..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={1}
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                </div>

                {/* Send Button */}
                <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={(!message.trim() && pendingFiles.length === 0) || disabled}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Gửi tin nhắn"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>


        </div>
    );
};

export default MessageInput; 