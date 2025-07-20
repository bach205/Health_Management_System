require('dotenv').config();
const QueueService = require('../src/services/queue.service');

async function testAssignQueueNumber() {
  try {
    console.log('--- TEST ASSIGN QUEUE NUMBER ---');
    const testData = {
      appointment_id: 42,
      patient_id: 36,
      clinic_id: 9,
      slot_date: '2025-07-20',
      slot_time: '08:00:00',
      registered_online: true
    };
    console.log('Test data:', testData);
    const queue = await QueueService.assignQueueNumber(testData);
    console.log('Queue created:', {
      id: queue.id,
      queue_number: queue.queue_number,
      shift_type: queue.shift_type,
      slot_date: queue.slot_date,
      patient: queue.patient?.user?.full_name,
      email: queue.patient?.user?.email
    });
    console.log('✅ Nếu bạn thấy Queue created và không có lỗi, hệ thống đã cấp số thứ tự và gửi email!');
  } catch (err) {
    console.error('❌ Lỗi khi cấp số thứ tự:', err.message);
  }
}

testAssignQueueNumber(); 