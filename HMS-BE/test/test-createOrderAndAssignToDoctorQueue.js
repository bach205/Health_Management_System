const QueueService = require('../src/services/queue.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCreateOrderAndAssignToDoctorQueue() {
  console.log('=== Testing createOrderAndAssignToDoctorQueue Function ===\n');

  try {
    // Tìm một appointment hợp lệ để test
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

    console.log('Found appointment for testing:');
    console.log(`- Patient: ${appointment.patient?.full_name || 'Unknown'}`);
    console.log(`- Doctor: ${appointment.doctor?.full_name || 'Unknown'}`);
    console.log(`- Clinic: ${appointment.clinic?.name || 'Unknown'}`);
    console.log(`- Date: ${appointment.appointment_date.toISOString().split('T')[0]}`);
    console.log(`- Time: ${appointment.appointment_time.toTimeString().slice(0, 8)}`);

    // Tìm một doctor khác có slot rảnh
    const availableDoctor = await prisma.availableSlot.findFirst({
      where: {
        is_available: true,
        doctor_id: { not: appointment.doctor_id },
        slot_date: { gte: new Date() }
      },
      include: {
        doctor: true,
        clinic: true
      },
      orderBy: [
        { slot_date: "asc" },
        { start_time: "asc" }
      ]
    });

    if (!availableDoctor) {
      console.log('❌ No available doctor with free slots found for testing');
      return;
    }

    console.log('\nFound available doctor for transfer:');
    console.log(`- Doctor: ${availableDoctor.doctor?.full_name || 'Unknown'}`);
    console.log(`- Clinic: ${availableDoctor.clinic?.name || 'Unknown'}`);
    console.log(`- Available Date: ${availableDoctor.slot_date.toISOString().split('T')[0]}`);
    console.log(`- Available Time: ${availableDoctor.start_time.toTimeString().slice(0, 8)}`);

    console.log('\n🚀 Testing createOrderAndAssignToDoctorQueue...');

    // Test function
    const result = await QueueService.createOrderAndAssignToDoctorQueue({
      patient_id: appointment.patient_id,
      from_clinic_id: appointment.clinic_id,
      to_clinic_id: availableDoctor.clinic_id,
      to_doctor_id: availableDoctor.doctor_id,
      reason: "Test transfer - Patient needs specialist consultation",
      note: "This is a test transfer",
      extra_cost: 50000,
      appointment_id: appointment.id,
      priority: 2
    });

    console.log('\n✅ Transfer successful!');
    console.log('Result:', {
      orderId: result.order?.id,
      queueId: result.queue?.id,
      newQueueNumber: result.queue?.queue_number,
      assignedDoctor: result.assignedDoctor?.full_name,
      slotDate: result.slot?.slot_date.toISOString().split('T')[0],
      slotTime: result.slot?.start_time.toTimeString().slice(0, 8)
    });

    // Cleanup: Xóa test data
    console.log('\n🧹 Cleaning up test data...');
    
    if (result.queue?.id) {
      await prisma.queue.delete({
        where: { id: result.queue.id }
      });
      console.log('✅ Test queue deleted');
    }

    if (result.order?.id) {
      await prisma.examinationOrder.delete({
        where: { id: result.order.id }
      });
      console.log('✅ Test order deleted');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing createOrderAndAssignToDoctorQueue:', error.message);
    
    if (error.message.includes('Bác sĩ được chọn không có ca khám nào rảnh trong tương lai')) {
      console.log('ℹ️ This is expected - no available slots in the future');
    } else if (error.message.includes('Bệnh nhân đã có trong hàng đợi phòng khám này')) {
      console.log('ℹ️ This is expected - patient already in queue');
    } else {
      console.log('❌ Unexpected error occurred');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testCreateOrderAndAssignToDoctorQueue(); 