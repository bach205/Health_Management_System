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
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSendMessage = () => {
        if (!message.trim() || disabled) return;

        const messageData: ISendMessageData = {
            text: message.trim(),
            toId,
            conversationId,
            message_type: 'text'
        };

        onSendMessage(messageData);
        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Tạo URL cho file để preview
        const fileUrl = URL.createObjectURL(file);

        const messageData: ISendMessageData = {
            text: '',
            file_url: fileUrl,
            file_name: file.name,
            file_type: file.type,
            toId,
            conversationId,
            message_type: file.type.startsWith('image/') ? 'image' : 'file'
        };

        onSendMessage(messageData);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = 'image/*';
            fileInputRef.current.click();
        }
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
            />

            {/* Message Input */}
            <div className="flex space-x-2 items-center">
                {/* Attachment Buttons */}
                <div className="flex items-center space-x-1">
                    <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={disabled}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Gửi hình ảnh"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={handleFileUploadClick}
                        disabled={disabled}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Gửi tệp tin"
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
                    disabled={!message.trim() || disabled}
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