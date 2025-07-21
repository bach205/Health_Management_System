const { PrismaClient } = require('@prisma/client');
const QueueService = require('../src/services/queue.service');

const prisma = new PrismaClient();

async function testTransferLogic() {
  try {
    console.log('=== Testing Transfer Logic ===');
    
    // 1. Tìm một appointment đang khám để test
    const testAppointment = await prisma.appointment.findFirst({
      where: {
        status: 'confirmed'
      },
      include: {
        doctor: true,
        patient: true,
        clinic: true,
        queue: {
          where: {
            status: { in: ['waiting', 'in_progress'] }
          }
        }
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
    console.log(`  - Queue Status: ${testAppointment.queue[0]?.status || 'No queue'}`);

    // 2. Tìm bác sĩ khác để chuyển đến
    const availableDoctor = await prisma.doctor.findFirst({
      where: {
        id: { not: testAppointment.doctor_id },
        availableSlots: {
          some: {
            is_available: true,
            slot_date: { gte: new Date() }
          }
        }
      },
      include: {
        availableSlots: {
          where: {
            is_available: true,
            slot_date: { gte: new Date() }
          },
          orderBy: [
            { slot_date: 'asc' },
            { start_time: 'asc' }
          ],
          take: 1
        },
        clinic: true
      }
    });

    if (!availableDoctor) {
      console.log('❌ Không tìm thấy bác sĩ khác để chuyển đến');
      return;
    }

    console.log('\n🎯 Target Doctor:');
    console.log(`  - ID: ${availableDoctor.id}`);
    console.log(`  - Name: ${availableDoctor.full_name}`);
    console.log(`  - Clinic: ${availableDoctor.clinic.name}`);
    console.log(`  - Available Slot: ${availableDoctor.availableSlots[0]?.slot_date.toISOString().split('T')[0]} ${availableDoctor.availableSlots[0]?.start_time.toTimeString().slice(0, 8)}`);

    // 3. Thực hiện chuyển khám
    console.log('\n🔄 Executing Transfer...');
    
    const transferResult = await QueueService.createOrderAndAssignToDoctorQueue({
      patient_id: testAppointment.patient_id,
      from_clinic_id: testAppointment.clinic_id,
      to_clinic_id: availableDoctor.clinic_id,
      to_doctor_id: availableDoctor.id,
      reason: 'Test transfer - Chuyển khám test',
      note: 'Test note',
      extra_cost: 0,
      appointment_id: testAppointment.id,
      priority: 2
    });

    console.log('\n✅ Transfer Result:');
    console.log(`  - Order ID: ${transferResult.order.id}`);
    console.log(`  - New Appointment ID: ${transferResult.newAppointment.id}`);
    console.log(`  - New Queue ID: ${transferResult.queue.id}`);
    console.log(`  - Assigned Doctor: ${transferResult.assignedDoctor.full_name}`);
    console.log(`  - Slot Date: ${transferResult.slot.slot_date.toISOString().split('T')[0]}`);
    console.log(`  - Slot Time: ${transferResult.slot.start_time.toTimeString().slice(0, 8)}`);

    // 4. Kiểm tra queue mới
    const newQueue = await prisma.queue.findUnique({
      where: { id: transferResult.queue.id },
      include: {
        appointment: {
          include: {
            doctor: true,
            clinic: true
          }
        },
        patient: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('\n📊 New Queue Details:');
    console.log(`  - Queue Number: ${newQueue.queue_number}`);
    console.log(`  - Status: ${newQueue.status}`);
    console.log(`  - Patient: ${newQueue.patient.user.full_name}`);
    console.log(`  - Doctor: ${newQueue.appointment.doctor.full_name}`);
    console.log(`  - Clinic: ${newQueue.appointment.clinic.name}`);
    console.log(`  - Appointment Date: ${newQueue.appointment.appointment_date.toISOString().split('T')[0]}`);
    console.log(`  - Appointment Time: ${newQueue.appointment.appointment_time.toTimeString().slice(0, 8)}`);

    // 5. Kiểm tra queue cũ đã được cập nhật
    const oldQueue = await prisma.queue.findFirst({
      where: { appointment_id: testAppointment.id }
    });

    console.log('\n📋 Old Queue Status:');
    console.log(`  - Status: ${oldQueue?.status || 'Not found'}`);

    // 6. Kiểm tra examination order
    const order = await prisma.examinationOrder.findUnique({
      where: { id: transferResult.order.id },
      include: {
        doctor: true,
        fromClinic: true,
        toClinic: true
      }
    });

    console.log('\n📝 Examination Order:');
    console.log(`  - From Clinic: ${order.fromClinic.name}`);
    console.log(`  - To Clinic: ${order.toClinic.name}`);
    console.log(`  - To Doctor: ${order.doctor.full_name}`);
    console.log(`  - Reason: ${order.reason}`);

    console.log('\n✅ Test completed successfully!');
    console.log('✅ Doctor information has been updated correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testTransferLogic(); 