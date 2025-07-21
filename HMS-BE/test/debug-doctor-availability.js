const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDoctorAvailability() {
    try {
        console.log('=== DEBUG DOCTOR AVAILABILITY ===');
        
        // 1. Kiểm tra bác sĩ Đỗ Hoàng Nam có tồn tại không
        console.log('\n1. Tìm bác sĩ Đỗ Hoàng Nam:');
        const doctor = await prisma.user.findFirst({
            where: {
                full_name: {
                    contains: 'Đỗ Hoàng Nam'
                },
                role: 'doctor'
            },
            include: {
                doctor: true
            }
        });
        console.log('Doctor found:', doctor);

        if (!doctor) {
            console.log('❌ Không tìm thấy bác sĩ Đỗ Hoàng Nam');
            return;
        }

        // 2. Kiểm tra slot của bác sĩ này
        console.log('\n2. Kiểm tra tất cả slot của bác sĩ:');
        const allSlots = await prisma.availableSlot.findMany({
            where: {
                doctor_id: doctor.id
            },
            orderBy: [
                { slot_date: 'asc' },
                { start_time: 'asc' }
            ]
        });
        console.log('All slots count:', allSlots.length);
        console.log('Sample slots:', allSlots.slice(0, 5));

        // 3. Kiểm tra slot rảnh (is_available = true)
        console.log('\n3. Kiểm tra slot rảnh:');
        const availableSlots = await prisma.availableSlot.findMany({
            where: {
                doctor_id: doctor.id,
                is_available: true
            },
            orderBy: [
                { slot_date: 'asc' },
                { start_time: 'asc' }
            ]
        });
        console.log('Available slots count:', availableSlots.length);
        console.log('Available slots:', availableSlots);

        // 4. Kiểm tra slot trong phòng khám cụ thể (clinic_id = 1)
        console.log('\n4. Kiểm tra slot trong clinic_id = 1:');
        const clinicSlots = await prisma.availableSlot.findMany({
            where: {
                doctor_id: doctor.id,
                clinic_id: 1,
                is_available: true
            },
            orderBy: [
                { slot_date: 'asc' },
                { start_time: 'asc' }
            ]
        });
        console.log('Clinic slots count:', clinicSlots.length);
        console.log('Clinic slots:', clinicSlots);

        // 5. Kiểm tra logic lọc thời gian
        console.log('\n5. Kiểm tra logic lọc thời gian:');
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentTime = now.toTimeString().slice(0, 8);
        console.log('Current time:', currentTime);
        console.log('Today:', today);

        const validSlots = clinicSlots.filter(slot => {
            const slotDate = new Date(slot.slot_date);
            const slotTime = slot.start_time instanceof Date ? slot.start_time.toTimeString().slice(0, 8) : slot.start_time;
            
            // Slot trong tương lai hoặc hôm nay nhưng chưa qua giờ hiện tại
            if (slotDate > today) return true;
            if (slotDate.getTime() === today.getTime() && slotTime > currentTime) return true;
            return false;
        });

        console.log('Valid slots count:', validSlots.length);
        console.log('Valid slots:', validSlots);

        // 6. Kiểm tra tất cả bác sĩ trong clinic
        console.log('\n6. Tất cả bác sĩ trong clinic_id = 1:');
        const allDoctorsInClinic = await prisma.availableSlot.findMany({
            where: {
                clinic_id: 1,
                is_available: true,
                doctor: {
                    role: 'doctor'
                }
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        full_name: true
                    }
                }
            },
            orderBy: [
                { slot_date: 'asc' },
                { start_time: 'asc' }
            ]
        });

        const doctorMap = new Map();
        allDoctorsInClinic.forEach(slot => {
            if (!doctorMap.has(slot.doctor_id)) {
                doctorMap.set(slot.doctor_id, {
                    doctor: slot.doctor,
                    slots: []
                });
            }
            doctorMap.get(slot.doctor_id).slots.push(slot);
        });

        console.log('Doctors in clinic:', Array.from(doctorMap.keys()).map(id => {
            const data = doctorMap.get(id);
            return `${data.doctor.full_name} (${data.slots.length} slots)`;
        }));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugDoctorAvailability(); 