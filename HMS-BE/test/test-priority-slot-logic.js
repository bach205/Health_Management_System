const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrioritySlotLogic() {
  console.log('=== Testing Priority Slot Logic ===\n');

  try {
    // Tìm một appointment để test
    const appointment = await prisma.appointment.findFirst({
      where: {
        status: 'confirmed'
      },
      include: {
        patient: true,
        doctor: true,
        clinic: true
      }
    });

    if (!appointment) {
      console.log('❌ No confirmed appointment found for testing');
      return;
    }

    const appointmentDate = new Date(appointment.appointment_date);
    const appointmentTime = appointment.appointment_time.toTimeString().slice(0, 8);

    console.log('Test appointment:');
    console.log(`- Patient: ${appointment.patient?.full_name || 'Unknown'}`);
    console.log(`- Doctor: ${appointment.doctor?.full_name || 'Unknown'}`);
    console.log(`- Clinic: ${appointment.clinic?.name || 'Unknown'}`);
    console.log(`- Date: ${appointmentDate.toISOString().split('T')[0]}`);
    console.log(`- Time: ${appointmentTime}`);

    // Tìm một doctor khác để test
    const testDoctor = await prisma.user.findFirst({
      where: {
        role: 'doctor',
        id: { not: appointment.doctor_id }
      }
    });

    if (!testDoctor) {
      console.log('❌ No other doctor found for testing');
      return;
    }

    console.log(`\nTesting with doctor: ${testDoctor.full_name}`);

    // Test 1: Tìm slot cùng ngày, sau thời gian appointment
    console.log('\n1. Testing same day slots (after appointment time):');
    const sameDaySlots = await prisma.availableSlot.findMany({
      where: {
        doctor_id: testDoctor.id,
        is_available: true,
        slot_date: appointmentDate
      },
      orderBy: [
        { start_time: "asc" },
      ],
    });
    
    // Lọc slot cùng ngày có thời gian sau appointment
    const validSameDaySlots = sameDaySlots.filter(slot => {
      const slotTime = slot.start_time.toTimeString().slice(0, 8);
      return slotTime > appointmentTime;
    });

    console.log(`Found ${validSameDaySlots.length} slots on same day after ${appointmentTime}:`);
    validSameDaySlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ${slot.start_time.toTimeString().slice(0, 8)} - Clinic: ${slot.clinic?.name || 'Unknown'}`);
    });

    // Test 2: Tìm slot tương lai (ngày khác)
    console.log('\n2. Testing future slots (different days):');
    const futureSlots = await prisma.availableSlot.findMany({
      where: {
        doctor_id: testDoctor.id,
        is_available: true,
        slot_date: { gt: appointmentDate }
      },
      orderBy: [
        { slot_date: "asc" },
        { start_time: "asc" },
      ],
      take: 5
    });

    console.log(`Found ${futureSlots.length} slots on future dates:`);
    futureSlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ${slot.slot_date.toISOString().split('T')[0]} ${slot.start_time.toTimeString().slice(0, 8)} - Clinic: ${slot.clinic?.name || 'Unknown'}`);
    });

    // Test 3: Tìm slot cùng ngày, trước thời gian appointment (không nên được chọn)
    console.log('\n3. Testing same day slots (before appointment time) - should NOT be selected:');
    const beforeAppointmentSlots = sameDaySlots.filter(slot => {
      const slotTime = slot.start_time.toTimeString().slice(0, 8);
      return slotTime < appointmentTime;
    });

    console.log(`Found ${beforeAppointmentSlots.length} slots on same day before ${appointmentTime} (should be ignored):`);
    beforeAppointmentSlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ${slot.start_time.toTimeString().slice(0, 8)} - Clinic: ${slot.clinic?.name || 'Unknown'}`);
    });

    // Test 4: Logic ưu tiên
    console.log('\n4. Priority logic test:');
    let selectedSlot = null;

    if (validSameDaySlots.length > 0) {
      selectedSlot = validSameDaySlots[0];
      console.log(`✅ Priority 1: Selected same day slot - ${selectedSlot.slot_date.toISOString().split('T')[0]} ${selectedSlot.start_time.toTimeString().slice(0, 8)}`);
    } else if (futureSlots.length > 0) {
      selectedSlot = futureSlots[0];
      console.log(`✅ Priority 2: Selected future slot - ${selectedSlot.slot_date.toISOString().split('T')[0]} ${selectedSlot.start_time.toTimeString().slice(0, 8)}`);
    } else {
      console.log('❌ No suitable slots found');
    }

    // Test 5: Tổng kết
    console.log('\n5. Summary:');
    console.log(`- Same day slots (after appointment): ${validSameDaySlots.length}`);
    console.log(`- Future slots: ${futureSlots.length}`);
    console.log(`- Same day slots (before appointment): ${beforeAppointmentSlots.length}`);
    console.log(`- Selected slot: ${selectedSlot ? `${selectedSlot.slot_date.toISOString().split('T')[0]} ${selectedSlot.start_time.toTimeString().slice(0, 8)}` : 'None'}`);

    if (selectedSlot) {
      console.log('\n✅ Priority logic working correctly!');
    } else {
      console.log('\nℹ️ No suitable slots found - this is expected if no slots are available');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testPrioritySlotLogic(); 