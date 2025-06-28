const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== Checking Patients ===');
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        user: {
          select: {
            full_name: true,
            email: true
          }
        }
      }
    });
    console.log('Patients:', patients);

    console.log('\n=== Checking Appointments ===');
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        patient_id: true,
        doctor_id: true,
        clinic_id: true,
        appointment_date: true,
        status: true
      }
    });
    console.log('Appointments:', appointments);

    // Check for orphaned appointments
    const patientIds = patients.map(p => p.id);
    const orphanedAppointments = appointments.filter(apt => !patientIds.includes(apt.patient_id));
    
    if (orphanedAppointments.length > 0) {
      console.log('\n=== Orphaned Appointments ===');
      console.log('These appointments reference non-existent patients:');
      console.log(orphanedAppointments);
    }

    // Check for orphaned appointments in reverse
    const appointmentPatientIds = [...new Set(appointments.map(apt => apt.patient_id))];
    const missingPatients = appointmentPatientIds.filter(pid => !patientIds.includes(pid));
    
    if (missingPatients.length > 0) {
      console.log('\n=== Missing Patients ===');
      console.log('These patient IDs are referenced in appointments but don\'t exist:');
      console.log(missingPatients);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData(); 