export interface IMessage {
    id: number;
    text: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
    message_type: 'text' | 'file' | 'image';
    toId: number;
    sendById: number;
    conversationId: number;
    is_read: boolean;
    created_at: string;
    updated_at?: string;
    sendBy: IUser;
    to: IUser;
}

export interface IConversation {
    id: number;
    name?: string;
    last_message_at: string;
    created_at: string;
    participants: IConversationParticipant[];
    lastMessage?: IMessage;
    unreadCount?: number;
}

export interface IConversationParticipant {
    id: number;
    conversationId: number;
    userId: number;
    user: IUser;
}

export interface IUser {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
}

export interface ISendMessageData {
    text: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
    message_type?: 'text' | 'file' | 'image';
    toId: number;
    conversationId: number;
}

export interface IUpdateMessageData {
    text?: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
    message_type?: 'text' | 'file' | 'image';
}

export interface IChatResponse {
    success: boolean;
    data: any;
    message?: string;
} 