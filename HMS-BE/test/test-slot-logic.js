const QueueService = require('../src/services/queue.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSlotLogic() {
  console.log('=== Testing Slot Logic in createOrderAndAssignToDoctorQueue ===\n');

  try {
    // Test 1: Kiểm tra logic tìm slot trong tương lai
    console.log('1. Testing slot finding logic...');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentTime = now.toTimeString().slice(0, 8);
    
    console.log('Current time:', now.toISOString());
    console.log('Today (00:00:00):', today.toISOString());
    console.log('Current time (HH:mm:ss):', currentTime);
    
    // Tìm slot rảnh trong tương lai
    const availableSlots = await prisma.availableSlot.findMany({
      where: {
        is_available: true,
        OR: [
          // Slot trong tương lai (ngày mai trở đi)
          {
            slot_date: { gt: today }
          }
        ]
      },
      orderBy: [
        { slot_date: "asc" },
        { start_time: "asc" },
      ],
      take: 5, // Lấy 5 slot đầu tiên
      include: {
        doctor: true,
        clinic: true
      }
    });
    
    // Lọc thêm slot hôm nay nhưng giờ chưa qua (xử lý ở application level)
    const todaySlots = await prisma.availableSlot.findMany({
      where: {
        is_available: true,
        slot_date: today
      },
      include: {
        doctor: true,
        clinic: true
      }
    });
    
    // Lọc slot hôm nay có giờ chưa qua
    const validTodaySlots = todaySlots.filter(slot => {
      const slotTime = slot.start_time.toTimeString().slice(0, 8);
      return slotTime > currentTime;
    });
    
    // Kết hợp cả hai danh sách
    const allValidSlots = [...availableSlots, ...validTodaySlots].sort((a, b) => {
      if (a.slot_date.getTime() !== b.slot_date.getTime()) {
        return a.slot_date.getTime() - b.slot_date.getTime();
      }
      return a.start_time.getTime() - b.start_time.getTime();
    }).slice(0, 5);
    
    console.log('\nAvailable slots in future:');
    allValidSlots.forEach((slot, index) => {
      console.log(`${index + 1}. Date: ${slot.slot_date.toISOString().split('T')[0]}, Time: ${slot.start_time.toTimeString().slice(0, 8)}, Doctor: ${slot.doctor?.full_name || 'Unknown'}, Clinic: ${slot.clinic?.name || 'Unknown'}`);
    });
    
    // Test 2: Kiểm tra logic với doctor cụ thể
    if (allValidSlots.length > 0) {
      const testSlot = allValidSlots[0];
      console.log(`\n2. Testing with specific doctor (${testSlot.doctor?.full_name}) and clinic (${testSlot.clinic?.name})...`);
      
             // Tìm slot cho doctor cụ thể (tương lai)
       const futureDoctorSlots = await prisma.availableSlot.findFirst({
         where: {
           doctor_id: testSlot.doctor_id,
           clinic_id: testSlot.clinic_id,
           is_available: true,
           slot_date: { gt: today }
         },
         orderBy: [
           { slot_date: "asc" },
           { start_time: "asc" },
         ],
       });
       
       // Tìm slot hôm nay cho doctor
       const todayDoctorSlots = await prisma.availableSlot.findMany({
         where: {
           doctor_id: testSlot.doctor_id,
           clinic_id: testSlot.clinic_id,
           is_available: true,
           slot_date: today
         },
         orderBy: [
           { start_time: "asc" },
         ],
       });
       
       // Lọc slot hôm nay có giờ chưa qua
       const validTodayDoctorSlots = todayDoctorSlots.filter(slot => {
         const slotTime = slot.start_time.toTimeString().slice(0, 8);
         return slotTime > currentTime;
       });
       
       const doctorSlots = futureDoctorSlots || validTodayDoctorSlots[0];
      
      if (doctorSlots) {
        console.log('✅ Found available slot for doctor:', {
          date: doctorSlots.slot_date.toISOString().split('T')[0],
          time: doctorSlots.start_time,
          doctor: testSlot.doctor?.full_name
        });
      } else {
        console.log('❌ No available slots found for doctor');
      }
    }
    
    // Test 3: Kiểm tra slot đã qua
    console.log('\n3. Testing past slots (should not be found)...');
    
    // Tìm slot trong quá khứ
    const pastDateSlots = await prisma.availableSlot.findMany({
      where: {
        is_available: true,
        slot_date: { lt: today }
      },
      take: 2
    });
    
    // Tìm slot hôm nay đã qua giờ
    const todayPastSlots = await prisma.availableSlot.findMany({
      where: {
        is_available: true,
        slot_date: today
      },
      take: 5
    });
    
    // Lọc slot hôm nay đã qua giờ
    const invalidTodaySlots = todayPastSlots.filter(slot => {
      const slotTime = slot.start_time.toTimeString().slice(0, 8);
      return slotTime < currentTime;
    });
    
    const pastSlots = [...pastDateSlots, ...invalidTodaySlots];
    
    console.log('Past slots found:', pastSlots.length);
    pastSlots.forEach((slot, index) => {
      console.log(`${index + 1}. Date: ${slot.slot_date.toISOString().split('T')[0]}, Time: ${slot.start_time.toTimeString().slice(0, 8)}`);
    });
    
    console.log('\n✅ Slot logic test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing slot logic:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testSlotLogic(); 