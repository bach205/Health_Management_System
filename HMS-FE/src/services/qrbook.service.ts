import mainRequest from '../api/mainRequest';

export const bookAppointmentByQRService = async (data: any) => {
  return mainRequest.post('/api/appointment/book-by-qr', data).then((res: any) => res.data);
}; 