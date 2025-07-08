import mainRequest from '../api/mainRequest';

export const findOrCreateDirectConversation = async (userId1: number, userId2: number) => {
    const res = await mainRequest.get(`/api/v1/conversation/direct/${userId1}/${userId2}`);
    return res.data.data;
}; 