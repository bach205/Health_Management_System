import instance from "./mainRequest";
import { IChatResponse } from "../types/index.type";

const BASE_URL = "chat";

export const createChat = (chat: Partial<IChatResponse>) => {
  return instance.post("/chat", chat);
};

export const getAllChats = (search = "") => {
  return instance.get(`/chat?search=${search}`);
};

export const getChatById = (id: number) => {
  return instance.get(`${BASE_URL}/${id}`);
};

export const updateChat = (id: number, chat: Partial<IChatResponse>) => {
  return instance.put(`${BASE_URL}/update/${id}`, chat);
};

export const deleteChat = (id: number) => {
  return instance.delete(`${BASE_URL}/delete/${id}`);
};

export const getChatsByConversationId = (conversationId: number) => {
  return instance.get(`/chat/conversation/${conversationId}`);
};
