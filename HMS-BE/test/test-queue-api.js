const axios = require('axios');

// Cấu hình base URL
const BASE_URL = 'http://localhost:8080/api/v1';

// Token test (bạn cần thay thế bằng token thực)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MjA3Nzg4MSwiZXhwIjoxNzUyMTY0MjgxfQ.KWeh9t1xFLhQd-eJpUdZtciwOuIwvhWqVBT90e2m8V8';

// Headers cho request
const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testQueueAPI() {
  try {
    console.log('🚀 Bắt đầu test API Queue...\n');

    // Test 1: Lấy queue hôm nay
    console.log('📅 Test 1: Lấy queue hôm nay');
    console.log('GET /queues/today');
    try {
      const response1 = await axios.get(`${BASE_URL}/queues/today`, { headers });
      console.log('✅ Thành công:', response1.data.message);
      console.log('📊 Số lượng queue:', response1.data.metadata.length);
      if (response1.data.metadata.length > 0) {
        console.log('📋 Queue đầu tiên:', {
          id: response1.data.metadata[0].id,
          queue_number: response1.data.metadata[0].queue_number,
          patient_name: response1.data.metadata[0].patient?.user?.full_name,
          clinic_name: response1.data.metadata[0].clinic?.name,
          status: response1.data.metadata[0].status
        });
      }
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 2: Lấy queue ngày mai
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log('📅 Test 2: Lấy queue ngày mai');
    console.log(`GET /queues/today?date=${tomorrowStr}`);
    try {
      const response2 = await axios.get(`${BASE_URL}/queues/today?date=${tomorrowStr}`, { headers });
      console.log('✅ Thành công:', response2.data.message);
      console.log('📊 Số lượng queue:', response2.data.metadata.length);
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 3: Lấy queue ngày kia
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
    
    console.log('📅 Test 3: Lấy queue ngày kia');
    console.log(`GET /queues/today?date=${dayAfterTomorrowStr}`);
    try {
      const response3 = await axios.get(`${BASE_URL}/queues/today?date=${dayAfterTomorrowStr}`, { headers });
      console.log('✅ Thành công:', response3.data.message);
      console.log('📊 Số lượng queue:', response3.data.metadata.length);
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 4: Lấy queue ngày cụ thể (hôm qua)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log('📅 Test 4: Lấy queue hôm qua');
    console.log(`GET /queues/today?date=${yesterdayStr}`);
    try {
      const response4 = await axios.get(`${BASE_URL}/queues/today?date=${yesterdayStr}`, { headers });
      console.log('✅ Thành công:', response4.data.message);
      console.log('📊 Số lượng queue:', response4.data.metadata.length);
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 5: Test với ngày không hợp lệ
    console.log('📅 Test 5: Test với ngày không hợp lệ');
    console.log('GET /queues/today?date=invalid-date');
    try {
      const response5 = await axios.get(`${BASE_URL}/queues/today?date=invalid-date`, { headers });
      console.log('✅ Thành công:', response5.data.message);
      console.log('📊 Số lượng queue:', response5.data.metadata.length);
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Hoàn thành test API Queue!');

  } catch (error) {
    console.error('💥 Lỗi chung:', error.message);
  }
}

// Hàm test không cần token (test trực tiếp service)
async function testQueueService() {
  try {
    console.log('🔧 Test trực tiếp QueueService...\n');
    
    const QueueService = require('../src/services/queue.service');
    const prisma = require('../src/config/prisma');

    // Test 1: Lấy queue hôm nay
    console.log('📅 Test 1: Lấy queue hôm nay');
    const todayQueues = await QueueService.getQueuesByDate();
    console.log('✅ Thành công');
    console.log('📊 Số lượng queue:', todayQueues.length);
    if (todayQueues.length > 0) {
      console.log('📋 Queue đầu tiên:', {
        id: todayQueues[0].id,
        queue_number: todayQueues[0].queue_number,
        patient_name: todayQueues[0].patient?.user?.full_name,
        clinic_name: todayQueues[0].clinic?.name,
        status: todayQueues[0].status,
        slot_date: todayQueues[0].slot_date
      });
    }
    console.log('');

    // Test 2: Lấy queue ngày mai
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log('📅 Test 2: Lấy queue ngày mai');
    console.log(`Ngày: ${tomorrowStr}`);
    const tomorrowQueues = await QueueService.getQueuesByDate(tomorrowStr);
    console.log('✅ Thành công');
    console.log('📊 Số lượng queue:', tomorrowQueues.length);
    console.log('');

    // Test 3: Lấy queue ngày kia
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
    
    console.log('📅 Test 3: Lấy queue ngày kia');
    console.log(`Ngày: ${dayAfterTomorrowStr}`);
    const dayAfterTomorrowQueues = await QueueService.getQueuesByDate(dayAfterTomorrowStr);
    console.log('✅ Thành công');
    console.log('📊 Số lượng queue:', dayAfterTomorrowQueues.length);
    console.log('');

    console.log('🎉 Hoàn thành test QueueService!');
    await prisma.$disconnect();

  } catch (error) {
    console.error('💥 Lỗi:', error.message);
  }
}

// Chạy test
console.log('Chọn loại test:');
console.log('1. Test API (cần server chạy và token)');
console.log('2. Test Service trực tiếp (không cần server)');
console.log('');

// Mặc định chạy test service trực tiếp
testQueueService(); 