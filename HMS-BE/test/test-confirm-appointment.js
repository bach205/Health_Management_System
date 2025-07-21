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

async function testConfirmAppointment() {
  try {
    console.log('🚀 Bắt đầu test xác nhận appointment và gửi mail...\n');

    // Test 1: Xác nhận appointment qua API
    console.log('📋 Test 1: Xác nhận appointment qua API');
    console.log('POST /appointment/confirm');
    try {
      const confirmData = {
        appointment_id: 42 // ID appointment có sẵn (pending)
      };
      console.log('Request data:', confirmData);
      
      const response = await axios.post(`${BASE_URL}/appointment/confirm`, confirmData, { headers });
      console.log('✅ Thành công:', response.data.message);
      console.log('📊 Thông tin appointment:', {
        id: response.data.data.id,
        status: response.data.data.status,
        patient_name: response.data.data.patient?.full_name,
        patient_email: response.data.data.patient?.email,
        doctor_name: response.data.data.doctor?.full_name,
        clinic_name: response.data.data.clinic?.name,
        appointment_date: response.data.data.appointment_date,
        appointment_time: response.data.data.appointment_time
      });
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 2: Kiểm tra queue được tạo
    console.log('📋 Test 2: Kiểm tra queue được tạo');
    console.log('GET /queues/today');
    try {
      const response2 = await axios.get(`${BASE_URL}/queues/today`, { headers });
      console.log('✅ Thành công:', response2.data.message);
      console.log('📊 Tổng số queue:', response2.data.metadata.length);
      
      if (response2.data.metadata.length > 0) {
        console.log('📋 Danh sách queue mới nhất:');
        const latestQueues = response2.data.metadata.slice(-3); // Lấy 3 queue mới nhất
        latestQueues.forEach((queue, index) => {
          console.log(`  ${index + 1}. Số ${queue.queue_number} - ${queue.patient?.user?.full_name} - ${queue.clinic?.name} - ${queue.status} - Email: ${queue.patient?.user?.email}`);
        });
      }
    } catch (error) {
      console.log('❌ Lỗi:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Hoàn thành test xác nhận appointment!');

  } catch (error) {
    console.error('💥 Lỗi chung:', error.message);
  }
}

// Test trực tiếp service (không cần server)
async function testConfirmAppointmentDirect() {
  try {
    console.log('🔧 Test trực tiếp confirmAppointment service...\n');
    
    const appointmentService = require('../src/services/appointment.service');
    const prisma = require('../src/config/prisma');

    // Test xác nhận appointment
    console.log('🌅 Test xác nhận appointment ID 42');
    try {
      const result = await appointmentService.confirmAppointment({ appointment_id: 42 });
      console.log('✅ Thành công xác nhận appointment');
      console.log('📊 Thông tin:', {
        id: result.id,
        status: result.status,
        patient_name: result.patient?.full_name,
        patient_email: result.patient?.email,
        doctor_name: result.doctor?.full_name,
        clinic_name: result.clinic?.name
      });
    } catch (error) {
      console.log('❌ Lỗi:', error.message);
    }
    console.log('');

    await prisma.$disconnect();
    console.log('🎉 Hoàn thành test trực tiếp!');

  } catch (error) {
    console.error('💥 Lỗi chung:', error.message);
  }
}

// Chạy test
if (require.main === module) {
  console.log('Chọn loại test:');
  console.log('1. Test qua API (cần server chạy)');
  console.log('2. Test trực tiếp service (không cần server)');
  console.log('3. Cả hai');
  
  const choice = process.argv[2] || '3';
  
  if (choice === '1' || choice === '3') {
    testConfirmAppointment();
  }
  
  if (choice === '2' || choice === '3') {
    setTimeout(() => {
      testConfirmAppointmentDirect();
    }, 2000);
  }
}

module.exports = { testConfirmAppointment, testConfirmAppointmentDirect }; 