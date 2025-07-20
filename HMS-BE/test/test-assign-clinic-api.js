const QueueService = require('../src/services/queue.service');
const DoctorService = require('../src/services/doctor.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAssignClinicAPI() {
  console.log('=== Testing Assign Clinic API ===\n');

  try {
    // Test 1: Kiểm tra getAvailableDoctorsWithNearestSlot
    console.log('1. Testing getAvailableDoctorsWithNearestSlot...');
    
    const doctorService = new DoctorService();
    const clinicId = 1; // Thay đổi clinic ID phù hợp
    
    const availableDoctors = await doctorService.getAvailableDoctorsWithNearestSlot(clinicId);
    console.log(`Found ${availableDoctors.length} available doctors in clinic ${clinicId}:`);
    
    availableDoctors.forEach((doctor, index) => {
      console.log(`  ${index + 1}. ${doctor.doctor.full_name} - Slot: ${doctor.nearestSlot?.slot_date?.toISOString().split('T')[0]} ${doctor.nearestSlot?.start_time?.toTimeString().slice(0, 8)}`);
    });

    // Test 2: Kiểm tra createOrderAndAssignToDoctorQueue với data hợp lệ
    if (availableDoctors.length > 0) {
      console.log('\n2. Testing createOrderAndAssignToDoctorQueue...');
      
      // Tìm một appointment để test
      const appointment = await prisma.appointment.findFirst({
        where: {
          status: 'confirmed'
        }
      });

      if (appointment) {
        const testData = {
          patient_id: appointment.patient_id,
          from_clinic_id: appointment.clinic_id,
          to_clinic_id: clinicId,
          to_doctor_id: availableDoctors[0].doctor.id,
          reason: "Test transfer - Patient needs specialist consultation",
          note: "This is a test transfer",
          extra_cost: 50000,
          appointment_id: appointment.id,
          priority: 2
        };

        console.log('Test data:', testData);
        
        try {
          const result = await QueueService.createOrderAndAssignToDoctorQueue(testData);
          console.log('✅ Transfer successful!');
          console.log('Result:', {
            orderId: result.order?.id,
            queueId: result.queue?.id,
            assignedDoctor: result.assignedDoctor?.full_name,
            slotDate: result.slot?.slot_date?.toISOString().split('T')[0],
            slotTime: result.slot?.start_time?.toTimeString().slice(0, 8)
          });

          // Cleanup
          if (result.queue?.id) {
            await prisma.queue.delete({ where: { id: result.queue.id } });
            console.log('✅ Test queue deleted');
          }
          if (result.order?.id) {
            await prisma.examinationOrder.delete({ where: { id: result.order.id } });
            console.log('✅ Test order deleted');
          }
        } catch (error) {
          console.log('❌ Transfer failed:', error.message);
        }
      } else {
        console.log('❌ No confirmed appointment found for testing');
      }
    } else {
      console.log('\n2. Skipping createOrderAndAssignToDoctorQueue test - no available doctors');
    }

    // Test 3: Kiểm tra với doctor không có slot rảnh
    console.log('\n3. Testing with invalid doctor (no available slots)...');
    
    const invalidTestData = {
      patient_id: 1,
      from_clinic_id: 1,
      to_clinic_id: 1,
      to_doctor_id: 999, // Doctor không tồn tại
      reason: "Test transfer",
      appointment_id: 1,
      priority: 2
    };

    try {
      await QueueService.createOrderAndAssignToDoctorQueue(invalidTestData);
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      console.log('✅ Correctly failed with error:', error.message);
    }

    console.log('\n✅ API test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testAssignClinicAPI(); 