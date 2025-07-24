import instance from "./mainRequest";
import type { IConversation } from "../types/index.type";

const BASE_URL = "/api/v1/conversation";


export const createConversation = (payload: IConversation) => {
  return instance.post(`${BASE_URL}/create`, payload);
};

export const getAllConversations = () => {
  return instance.get(`${BASE_URL}`);
};

export const getConversationById = (id: number) => {
  return instance.get(`${BASE_URL}/${id}`);
};

export const updateConversation = (id: number, conversation: Partial<IConversation>) => {
  return instance.put(`${BASE_URL}/update/${id}`, conversation);
};

export const deleteConversation = (id: number) => {
  return instance.delete(`${BASE_URL}/delete/${id}`);
};
export const getConversationsByUserId = (userId: string) => {
  return instance.post(`/conversation/by-user`, { userId });
};

