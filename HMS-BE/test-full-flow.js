const QueueService = require('./src/services/queue.service');
const { sendPatientQueueNumberEmail } = require('./src/utils/staff.email');

async function testFullFlow() {
  console.log('=== TEST TOÀN BỘ FLOW APPOINTMENT -> QUEUE -> EMAIL ===\n');

  // Test các trường hợp thời gian khác nhau
  const testCases = [
    {
      name: 'Ca sáng 8h',
      appointmentTime: new Date('2024-01-15T08:00:00'),
      expectedShift: 'morning',
      expectedTime: '08:00:00'
    },
    {
      name: 'Ca chiều 14h',
      appointmentTime: new Date('2024-01-15T14:00:00'),
      expectedShift: 'afternoon',
      expectedTime: '14:00:00'
    },
    {
      name: 'Ca tối 18h30',
      appointmentTime: new Date('2024-01-15T18:30:00'),
      expectedShift: 'night',
      expectedTime: '18:30:00'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    
    // 1. Test xử lý thời gian
    let appointmentTimeStr;
    if (typeof testCase.appointmentTime === 'string') {
      appointmentTimeStr = testCase.appointmentTime;
    } else if (testCase.appointmentTime instanceof Date) {
      const hours = testCase.appointmentTime.getHours().toString().padStart(2, '0');
      const minutes = testCase.appointmentTime.getMinutes().toString().padStart(2, '0');
      const seconds = testCase.appointmentTime.getSeconds().toString().padStart(2, '0');
      appointmentTimeStr = `${hours}:${minutes}:${seconds}`;
    } else {
      appointmentTimeStr = '08:00:00';
    }
    
    console.log(`  Input time: ${testCase.appointmentTime}`);
    console.log(`  Processed time: ${appointmentTimeStr}`);
    console.log(`  Expected time: ${testCase.expectedTime}`);
    console.log(`  Time match: ${appointmentTimeStr === testCase.expectedTime ? '✓' : '✗'}`);
    
    // 2. Test shift type
    const shift = QueueService.getShiftTypeAndRange(appointmentTimeStr);
    console.log(`  Shift type: ${shift?.type || 'null'}`);
    console.log(`  Expected shift: ${testCase.expectedShift}`);
    console.log(`  Shift match: ${shift?.type === testCase.expectedShift ? '✓' : '✗'}`);
    
    // 3. Test email time formatting
    const emailTime = typeof appointmentTimeStr === 'string' ? appointmentTimeStr : 
                     (appointmentTimeStr instanceof Date ? 
                       `${appointmentTimeStr.getHours().toString().padStart(2, '0')}:${appointmentTimeStr.getMinutes().toString().padStart(2, '0')}:${appointmentTimeStr.getSeconds().toString().padStart(2, '0')}` : 
                       '08:00:00');
    
    console.log(`  Email time: ${emailTime}`);
    console.log(`  Email time match: ${emailTime === testCase.expectedTime ? '✓' : '✗'}`);
    
    // 4. Test gửi email (không thực sự gửi, chỉ test format)
    try {
      await sendPatientQueueNumberEmail(
        'test@example.com',
        'Bệnh nhân Test',
        1,
        shift?.type || 'morning',
        '2024-01-15',
        emailTime,
        'Bác sĩ Test',
        'Phòng khám Test'
      );
      console.log(`  Email sent: ✓`);
    } catch (error) {
      console.log(`  Email error: ${error.message}`);
    }
  }

  console.log('\n=== KẾT LUẬN ===');
  console.log('Nếu tất cả test cases đều pass (✓), thì vấn đề đã được sửa.');
  console.log('Nếu vẫn có vấn đề, có thể do:');
  console.log('1. Dữ liệu appointment_time trong database bị sai');
  console.log('2. Múi giờ server khác với múi giờ local');
  console.log('3. Cần kiểm tra lại dữ liệu thực tế trong database');
}

testFullFlow().catch(console.error); 