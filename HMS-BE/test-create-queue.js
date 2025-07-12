const axios = require('axios');

// Cấu hình base URL
const BASE_URL = 'http://localhost:8080/api/v1';

// Token test (admin token)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjA3Nzg4MSwiZXhwIjoxNzUyMTY0MjgxfQ.KWeh9t1xFLhQd-eJpUdZtciwOuIwvhWqVBT90e2m8V8';

// Headers cho request
const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testCreateQueue() {
  try {
    console.log('🚀 Bắt đầu test tạo số thứ tự cho bệnh nhân...\n');

    // Test 1: Check-in từ appointment
    console.log('📋 Test 1: Check-in từ appointment');
    console.log('POST /queues/checkin');
    try {
      const checkinData = {
        appointment_id: 28 // ID appointment có sẵn
      };
      const response1 = await axios.post(`${BASE_URL}/queues/checkin`, checkinData, { headers });
      console.log('✅ Thành công:', response1.data.message);
      console.log('📊 Thông tin queue:', {
        id: response1.data.metadata.id,
        queue_number: response1.data.metadata.queue_number,
        shift_type: response1.data.metadata.shift_type,
        status: response1.data.metadata.status,
        patient_name: response1.data.metadata.patient?.user?.full_name,
        clinic_name: response1.data.metadata.clinic?.name
      });
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 2: Chỉ định thêm phòng khám (assign clinic)
    console.log('🏥 Test 2: Chỉ định thêm phòng khám');
    console.log('POST /queues/assign-clinic');
    try {
      const assignData = {
        patient_id: 8,
        to_clinic_id: 7,
        record_id: 5,
        priority: 2,
        slot_date: '2025-07-10',
        slot_time: '14:30:00'
      };
      const response2 = await axios.post(`${BASE_URL}/queues/assign-clinic`, assignData, { headers });
      console.log('✅ Thành công:', response2.data.message);
      console.log('📊 Thông tin queue:', {
        id: response2.data.metadata.id,
        queue_number: response2.data.metadata.queue_number,
        shift_type: response2.data.metadata.shift_type,
        status: response2.data.metadata.status,
        patient_name: response2.data.metadata.patient?.user?.full_name,
        clinic_name: response2.data.metadata.clinic?.name
      });
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 3: Tạo queue walk-in (không có appointment)
    console.log('🚶 Test 3: Tạo queue walk-in (test service trực tiếp)');
    try {
      const QueueService = require('./src/services/queue.service');
      const prisma = require('./src/config/prisma');

      const walkInData = {
        appointment_id: null,
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '09:30:00', // Sáng
        registered_online: false
      };

      const newQueue = await QueueService.assignQueueNumber(walkInData);
      console.log('✅ Thành công tạo queue walk-in');
      console.log('📊 Thông tin queue:', {
        id: newQueue.id,
        queue_number: newQueue.queue_number,
        shift_type: newQueue.shift_type,
        status: newQueue.status,
        patient_name: newQueue.patient?.user?.full_name,
        clinic_name: newQueue.clinic?.name,
        slot_date: newQueue.slot_date
      });

      await prisma.$disconnect();
    } catch (error) {
      console.log('❌ Lỗi:', error.message);
    }
    console.log('');

    // Test 4: Kiểm tra danh sách queue sau khi tạo
    console.log('📋 Test 4: Kiểm tra danh sách queue hôm nay');
    console.log('GET /queues/today');
    try {
      const response4 = await axios.get(`${BASE_URL}/queues/today`, { headers });
      console.log('✅ Thành công:', response4.data.message);
      console.log('📊 Tổng số queue:', response4.data.metadata.length);
      
      if (response4.data.metadata.length > 0) {
        console.log('📋 Danh sách queue:');
        response4.data.metadata.forEach((queue, index) => {
          console.log(`  ${index + 1}. Số ${queue.queue_number} - ${queue.patient?.user?.full_name} - ${queue.clinic?.name} - ${queue.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Hoàn thành test tạo số thứ tự!');

  } catch (error) {
    console.error('💥 Lỗi chung:', error.message);
  }
}

// Test trực tiếp service (không cần server)
async function testQueueServiceDirect() {
  try {
    console.log('🔧 Test trực tiếp QueueService...\n');
    
    const QueueService = require('./src/services/queue.service');
    const prisma = require('./src/config/prisma');

    // Test 1: Tạo queue sáng
    console.log('🌅 Test 1: Tạo queue ca sáng');
    try {
      const morningQueue = await QueueService.assignQueueNumber({
        appointment_id: null,
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '09:30:00',
        registered_online: false
      });
      console.log('✅ Thành công tạo queue sáng');
      console.log('📊 Thông tin:', {
        queue_number: morningQueue.queue_number,
        shift_type: morningQueue.shift_type,
        patient_name: morningQueue.patient?.user?.full_name
      });
    } catch (error) {
      console.log('❌ Lỗi:', error.message);
    }
    console.log('');

    // Test 2: Tạo queue chiều
    console.log('🌆 Test 2: Tạo queue ca chiều');
    try {
      const afternoonQueue = await QueueService.assignQueueNumber({
        appointment_id: null,
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '14:30:00',
        registered_online: false
      });
      console.log('✅ Thành công tạo queue chiều');
      console.log('📊 Thông tin:', {
        queue_number: afternoonQueue.queue_number,
        shift_type: afternoonQueue.shift_type,
        patient_name: afternoonQueue.patient?.user?.full_name
      });
    } catch (error) {
      console.log('❌ Lỗi:', error.message);
    }
    console.log('');

    // Test 3: Tạo queue tối
    console.log('🌙 Test 3: Tạo queue ca tối');
    try {
      const nightQueue = await QueueService.assignQueueNumber({
        appointment_id: null,
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '19:30:00',
        registered_online: false
      });
      console.log('✅ Thành công tạo queue tối');
      console.log('📊 Thông tin:', {
        queue_number: nightQueue.queue_number,
        shift_type: nightQueue.shift_type,
        patient_name: nightQueue.patient?.user?.full_name
      });
    } catch (error) {
      console.log('❌ Lỗi:', error.message);
    }
    console.log('');

    // Test 4: Kiểm tra danh sách queue
    console.log('📋 Test 4: Kiểm tra danh sách queue hôm nay');
    const todayQueues = await QueueService.getQueuesByDate('2025-07-10');
    console.log('✅ Thành công');
    console.log('📊 Tổng số queue:', todayQueues.length);
    
    if (todayQueues.length > 0) {
      console.log('📋 Danh sách queue:');
      todayQueues.forEach((queue, index) => {
        console.log(`  ${index + 1}. Số ${queue.queue_number} (${queue.shift_type}) - ${queue.patient?.user?.full_name} - ${queue.clinic?.name} - ${queue.status}`);
      });
    }

    await prisma.$disconnect();
    console.log('\n🎉 Hoàn thành test QueueService!');

  } catch (error) {
    console.error('💥 Lỗi:', error.message);
  }
}

// Chạy test
console.log('Chọn loại test:');
console.log('1. Test API (cần server chạy)');
console.log('2. Test Service trực tiếp (không cần server)');
console.log('');

// Mặc định chạy test service trực tiếp
testQueueServiceDirect(); 