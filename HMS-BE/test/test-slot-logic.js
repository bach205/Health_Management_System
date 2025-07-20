const { PrismaClient } = require('@prisma/client');
const QueueService = require('../src/services/queue.service');

const prisma = new PrismaClient();

async function testSlotLogic() {
  try {
    console.log('=== Testing Slot Logic (Slot > now & Nearest to Current Appointment) ===');
    
    // 1. Tìm một appointment đang khám để test
    const testAppointment = await prisma.appointment.findFirst({
      where: {
        status: 'confirmed'
      },
      include: {
        doctor: true,
        patient: true,
        clinic: true,
      }
    });

    if (!testAppointment) {
      console.log('❌ Không tìm thấy appointment để test');
      return;
    }

    console.log('📋 Test Appointment:');
    console.log(`  - ID: ${testAppointment.id}`);
    console.log(`  - Patient: ${testAppointment.patient.user.full_name}`);
    console.log(`  - Current Doctor: ${testAppointment.doctor.full_name}`);
    console.log(`  - Current Clinic: ${testAppointment.clinic.name}`);
    console.log(`  - Appointment Date: ${testAppointment.appointment_date.toISOString().split('T')[0]}`);
    console.log(`  - Appointment Time: ${testAppointment.appointment_time.toTimeString().slice(0, 8)}`);

    // 2. Tìm bác sĩ khác để test
    const availableDoctor = await prisma.doctor.findFirst({
      where: {
        id: { not: testAppointment.doctor_id },
        availableSlots: {
          some: {
            is_available: true
          }
        }
      },
      include: {
        availableSlots: {
          where: {
            is_available: true
          },
          orderBy: [
            { slot_date: 'asc' },
            { start_time: 'asc' }
          ]
        },
        clinic: true
      }
    });

    if (!availableDoctor) {
      console.log('❌ Không tìm thấy bác sĩ khác để test');
      return;
    }

    console.log('\n🎯 Target Doctor:');
    console.log(`  - ID: ${availableDoctor.id}`);
    console.log(`  - Name: ${availableDoctor.full_name}`);
    console.log(`  - Clinic: ${availableDoctor.clinic.name}`);
    console.log(`  - Total Available Slots: ${availableDoctor.availableSlots.length}`);

    // 3. Hiển thị tất cả slot của bác sĩ này
    console.log('\n📅 All Available Slots:');
    availableDoctor.availableSlots.forEach((slot, index) => {
      const slotDate = slot.slot_date.toISOString().split('T')[0];
      const slotTime = slot.start_time.toTimeString().slice(0, 8);
      const now = new Date();
      const slotDateTime = new Date(slot.slot_date);
      const isAfterNow = slotDateTime > now;
      
      console.log(`  ${index + 1}. ${slotDate} ${slotTime} - After Now: ${isAfterNow ? '✅' : '❌'}`);
    });

    // 4. Test logic tìm slot > now và gần nhất
    console.log('\n🔍 Testing Slot Selection Logic...');
    
    const now = new Date();
    const appointmentDate = new Date(testAppointment.appointment_date);
    
    // Lọc slot > now
    const futureSlots = availableDoctor.availableSlots.filter(slot => {
      const slotDateTime = new Date(slot.slot_date);
      return slotDateTime > now;
    });

    console.log(`\n📊 Slots after current time: ${futureSlots.length}`);
    futureSlots.forEach((slot, index) => {
      const slotDate = slot.slot_date.toISOString().split('T')[0];
      const slotTime = slot.start_time.toTimeString().slice(0, 8);
      const timeDiff = Math.abs(new Date(slot.slot_date).getTime() - appointmentDate.getTime());
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`  ${index + 1}. ${slotDate} ${slotTime} - Days from appointment: ${daysDiff}`);
    });

    if (futureSlots.length === 0) {
      console.log('❌ Không có slot nào sau thời gian hiện tại');
      return;
    }

    // Tìm slot gần nhất với appointment
    let closestSlot = futureSlots[0];
    let minTimeDiff = Math.abs(new Date(closestSlot.slot_date).getTime() - appointmentDate.getTime());
    
    for (const slot of futureSlots) {
      const slotDateTime = new Date(slot.slot_date);
      const timeDiff = Math.abs(slotDateTime.getTime() - appointmentDate.getTime());
      
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestSlot = slot;
      }
    }

    console.log('\n🎯 Selected Slot (Closest to appointment):');
    console.log(`  - Date: ${closestSlot.slot_date.toISOString().split('T')[0]}`);
    console.log(`  - Time: ${closestSlot.start_time.toTimeString().slice(0, 8)}`);
    console.log(`  - Days from appointment: ${Math.floor(minTimeDiff / (1000 * 60 * 60 * 24))}`);

    // 5. Test transfer logic
    console.log('\n🔄 Testing Transfer Logic...');
    
    try {
      const transferResult = await QueueService.createOrderAndAssignToDoctorQueue({
        patient_id: testAppointment.patient_id,
        from_clinic_id: testAppointment.clinic_id,
        to_clinic_id: availableDoctor.clinic_id,
        to_doctor_id: availableDoctor.id,
        reason: 'Test slot logic - Chuyển khám test',
        note: 'Test note',
        extra_cost: 0,
        appointment_id: testAppointment.id,
        priority: 2
      });

      console.log('\n✅ Transfer Result:');
      console.log(`  - New Appointment Date: ${transferResult.newAppointment.appointment_date.toISOString().split('T')[0]}`);
      console.log(`  - New Appointment Time: ${transferResult.newAppointment.appointment_time.toTimeString().slice(0, 8)}`);
      console.log(`  - Selected Slot Date: ${transferResult.slot.slot_date.toISOString().split('T')[0]}`);
      console.log(`  - Selected Slot Time: ${transferResult.slot.start_time.toTimeString().slice(0, 8)}`);
      
      // Kiểm tra xem slot được chọn có đúng không
      const isSlotAfterNow = new Date(transferResult.slot.slot_date) > now;
      const isSlotClosest = transferResult.slot.id === closestSlot.id;
      
      console.log(`  - Slot after now: ${isSlotAfterNow ? '✅' : '❌'}`);
      console.log(`  - Slot is closest: ${isSlotClosest ? '✅' : '❌'}`);
      
      if (isSlotAfterNow && isSlotClosest) {
        console.log('\n🎉 SUCCESS: Slot logic working correctly!');
      } else {
        console.log('\n⚠️  WARNING: Slot logic may have issues');
      }

    } catch (error) {
      console.log('\n❌ Transfer failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testSlotLogic(); 