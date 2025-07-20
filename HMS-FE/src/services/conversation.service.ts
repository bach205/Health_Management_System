import mainRequest from '../api/mainRequest';

export const findOrCreateDirectConversation = async (userId1: number, userId2: number) => {
    const res = await mainRequest.get(`/api/v1/conversation/direct/${userId1}/${userId2}`);
    return res.data.data;
}; 
export const createConversation = async (payload: {
    name: string;
    type: 'group';
    participantIds: string[];
}) => {
    try {
  const res = await mainRequest.post(`/api/v1/conversation`, payload);
  return res.data;
} catch (error: any) {
  console.error('❌ Lỗi tạo group:', error.response?.data || error.message);
}
};
