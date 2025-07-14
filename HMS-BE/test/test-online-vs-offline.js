const QueueService = require('../src/services/queue.service');
const prisma = require('../src/config/prisma');

async function testOnlineVsOffline() {
  try {
    console.log('🚀 Bắt đầu test so sánh đăng ký Online vs Offline...\n');
    
    const QueueService = require('../src/services/queue.service');
    const prisma = require('../src/config/prisma');

    // Test 1: Đăng ký Online (có appointment)
    console.log('💻 Test 1: Đăng ký Online (có appointment)');
    console.log('='.repeat(50));
    try {
      const onlineQueue = await QueueService.assignQueueNumber({
        appointment_id: 28, // Có appointment
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '14:30:00',
        registered_online: true
      });
      
      console.log('✅ Thành công tạo queue Online');
      console.log('📊 Thông tin chi tiết:');
      console.log(`   - ID Queue: ${onlineQueue.id}`);
      console.log(`   - Số thứ tự: ${onlineQueue.queue_number}`);
      console.log(`   - Loại ca: ${onlineQueue.shift_type}`);
      console.log(`   - Trạng thái: ${onlineQueue.status}`);
      console.log(`   - Đăng ký Online: ${onlineQueue.registered_online ? 'Có' : 'Không'}`);
      console.log(`   - Thời gian tạo: ${onlineQueue.created_at}`);
      console.log(`   - Ngày khám: ${onlineQueue.slot_date}`);
      console.log(`   - Bệnh nhân: ${onlineQueue.patient?.user?.full_name}`);
      console.log(`   - Phòng khám: ${onlineQueue.clinic?.name}`);
      console.log(`   - Có appointment: ${onlineQueue.appointment_id ? 'Có' : 'Không'}`);
      
    } catch (error) {
      console.log('❌ Lỗi tạo queue Online:', error.message);
    }
    console.log('');

    // Test 2: Đăng ký Offline (walk-in, không có appointment)
    console.log('🚶 Test 2: Đăng ký Offline (walk-in)');
    console.log('='.repeat(50));
    try {
      const offlineQueue = await QueueService.assignQueueNumber({
        appointment_id: null, // Không có appointment
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '14:30:00',
        registered_online: false
      });
      
      console.log('✅ Thành công tạo queue Offline');
      console.log('📊 Thông tin chi tiết:');
      console.log(`   - ID Queue: ${offlineQueue.id}`);
      console.log(`   - Số thứ tự: ${offlineQueue.queue_number}`);
      console.log(`   - Loại ca: ${offlineQueue.shift_type}`);
      console.log(`   - Trạng thái: ${offlineQueue.status}`);
      console.log(`   - Đăng ký Online: ${offlineQueue.registered_online ? 'Có' : 'Không'}`);
      console.log(`   - Thời gian tạo: ${offlineQueue.created_at}`);
      console.log(`   - Ngày khám: ${offlineQueue.slot_date}`);
      console.log(`   - Bệnh nhân: ${offlineQueue.patient?.user?.full_name}`);
      console.log(`   - Phòng khám: ${offlineQueue.clinic?.name}`);
      console.log(`   - Có appointment: ${offlineQueue.appointment_id ? 'Có' : 'Không'}`);
      
    } catch (error) {
      console.log('❌ Lỗi tạo queue Offline:', error.message);
    }
    console.log('');

    // Test 3: So sánh thời gian tạo
    console.log('⏱️ Test 3: So sánh thời gian tạo');
    console.log('='.repeat(50));
    try {
      const startTime = Date.now();
      
      // Tạo queue online
      const onlineStart = Date.now();
      const onlineQueue2 = await QueueService.assignQueueNumber({
        appointment_id: 28,
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '15:30:00',
        registered_online: true
      });
      const onlineTime = Date.now() - onlineStart;
      
      // Tạo queue offline
      const offlineStart = Date.now();
      const offlineQueue2 = await QueueService.assignQueueNumber({
        appointment_id: null,
        patient_id: 8,
        clinic_id: 7,
        slot_date: new Date('2025-07-10'),
        slot_time: '15:30:00',
        registered_online: false
      });
      const offlineTime = Date.now() - offlineStart;
      
      const totalTime = Date.now() - startTime;
      
      console.log('📊 Kết quả so sánh thời gian:');
      console.log(`   - Thời gian tạo queue Online: ${onlineTime}ms`);
      console.log(`   - Thời gian tạo queue Offline: ${offlineTime}ms`);
      console.log(`   - Tổng thời gian test: ${totalTime}ms`);
      console.log(`   - Chênh lệch: ${Math.abs(onlineTime - offlineTime)}ms`);
      
      if (onlineTime < offlineTime) {
        console.log('   - 🏆 Online nhanh hơn Offline');
      } else if (offlineTime < onlineTime) {
        console.log('   - 🏆 Offline nhanh hơn Online');
      } else {
        console.log('   - ⚖️ Thời gian bằng nhau');
      }
      
    } catch (error) {
      console.log('❌ Lỗi so sánh thời gian:', error.message);
    }
    console.log('');

    // Test 4: Kiểm tra danh sách queue theo loại đăng ký
    console.log('📋 Test 4: Kiểm tra danh sách queue theo loại đăng ký');
    console.log('='.repeat(50));
    try {
      const todayQueues = await QueueService.getQueuesByDate('2025-07-10');
      
      const onlineQueues = todayQueues.filter(q => q.registered_online === true);
      const offlineQueues = todayQueues.filter(q => q.registered_online === false);
      
      console.log('📊 Thống kê:');
      console.log(`   - Tổng số queue: ${todayQueues.length}`);
      console.log(`   - Queue Online: ${onlineQueues.length}`);
      console.log(`   - Queue Offline: ${offlineQueues.length}`);
      console.log('');
      
      if (onlineQueues.length > 0) {
        console.log('💻 Danh sách Queue Online:');
        onlineQueues.forEach((queue, index) => {
          console.log(`   ${index + 1}. Số ${queue.queue_number} - ${queue.patient?.user?.full_name} - ${queue.clinic?.name} - ${queue.status} - ${queue.created_at}`);
        });
      }
      console.log('');
      
      if (offlineQueues.length > 0) {
        console.log('🚶 Danh sách Queue Offline:');
        offlineQueues.forEach((queue, index) => {
          console.log(`   ${index + 1}. Số ${queue.queue_number} - ${queue.patient?.user?.full_name} - ${queue.clinic?.name} - ${queue.status} - ${queue.created_at}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Lỗi kiểm tra danh sách:', error.message);
    }
    console.log('');

    // Test 5: Test nhiều queue cùng lúc
    console.log('🔄 Test 5: Tạo nhiều queue cùng lúc');
    console.log('='.repeat(50));
    try {
      const promises = [];
      const startTime = Date.now();
      
      // Tạo 3 queue online (chiều)
      for (let i = 0; i < 3; i++) {
        promises.push(QueueService.assignQueueNumber({
          appointment_id: 28,
          patient_id: 8,
          clinic_id: 7,
          slot_date: new Date('2025-07-10'),
          slot_time: `14:${30 + i}:00`, // Chiều (13:00-17:00)
          registered_online: true
        }));
      }
      
      // Tạo 3 queue offline (tối)
      for (let i = 0; i < 3; i++) {
        promises.push(QueueService.assignQueueNumber({
          appointment_id: null,
          patient_id: 8,
          clinic_id: 7,
          slot_date: new Date('2025-07-10'),
          slot_time: `18:${30 + i}:00`, // Tối (18:00-22:00)
          registered_online: false
        }));
      }
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      console.log('✅ Thành công tạo 6 queue cùng lúc');
      console.log(`📊 Thời gian tổng: ${totalTime}ms`);
      console.log(`📊 Thời gian trung bình mỗi queue: ${(totalTime / 6).toFixed(2)}ms`);
      
      const onlineResults = results.filter(r => r.registered_online);
      const offlineResults = results.filter(r => !r.registered_online);
      
      console.log(`   - Queue Online tạo được: ${onlineResults.length}`);
      console.log(`   - Queue Offline tạo được: ${offlineResults.length}`);
      
    } catch (error) {
      console.log('❌ Lỗi tạo nhiều queue:', error.message);
    }
    console.log('');

    await prisma.$disconnect();
    console.log('🎉 Hoàn thành test so sánh Online vs Offline!');

  } catch (error) {
    console.error('💥 Lỗi chung:', error.message);
  }
}

// Chạy test
testOnlineVsOffline(); 