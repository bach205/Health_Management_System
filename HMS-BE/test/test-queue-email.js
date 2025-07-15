const QueueService = require('../src/services/queue.service');
const prisma = require('../src/config/prisma');

async function testQueueEmail() {
  try {
    console.log('Bắt đầu test gửi email thông báo số thứ tự...');
    
    // Test data
    const testData = {
      appointment_id: null, // Không có appointment (walk-in)
      patient_id: 8, // ID bệnh nhân có sẵn
      clinic_id: 7, // ID phòng khám có sẵn
      slot_date: new Date('2025-07-10'), // Ngày mai
      slot_time: '14:30:00', // Giờ chiều
      registered_online: false // Walk-in
    };

    console.log('Test data:', testData);
    
    // Gọi hàm assignQueueNumber
    const newQueue = await QueueService.assignQueueNumber(testData);
    
    console.log('Queue được tạo:', {
      id: newQueue.id,
      queue_number: newQueue.queue_number,
      shift_type: newQueue.shift_type,
      patient_email: newQueue.patient?.user?.email,
      patient_name: newQueue.patient?.user?.full_name
    });
    
    console.log('✅ Test thành công! Email đã được gửi.');
    
  } catch (error) {
    console.error('❌ Test thất bại:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testQueueEmail(); 