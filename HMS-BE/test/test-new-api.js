const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNewAPI() {
    try {
        console.log('=== TEST NEW API ===');
        
        // Test API getAvailableDoctorsWithNearestSlot với clinic_id = 1
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentTime = now.toTimeString().slice(0, 8);

        // Tìm tất cả slot rảnh (không chỉ trong clinic cụ thể)
        const allSlots = await prisma.availableSlot.findMany({
            where: {
                is_available: true,
                doctor: {
                    role: 'doctor',
                },
            },
            orderBy: [
                { slot_date: 'asc' },
                { start_time: 'asc' },
            ],
            include: {
                doctor: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                },
                clinic: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
        });

        console.log('All available slots count:', allSlots.length);

        // Lọc slot hợp lệ
        const validSlots = allSlots.filter(slot => {
            const slotDate = new Date(slot.slot_date);
            const slotTime = slot.start_time instanceof Date ? slot.start_time.toTimeString().slice(0, 8) : slot.start_time;
            
            // Slot trong tương lai hoặc hôm nay nhưng chưa qua giờ hiện tại
            if (slotDate > today) return true;
            if (slotDate.getTime() === today.getTime() && slotTime > currentTime) return true;
            return false;
        });

        console.log('Valid slots count:', validSlots.length);

        // Group theo doctor_id
        const doctorMap = new Map();
        for (const slot of validSlots) {
            const docId = slot.doctor_id;
            if (!doctorMap.has(docId)) {
                doctorMap.set(docId, {
                    doctor: slot.doctor,
                    nearestSlot: slot,
                    clinic: slot.clinic,
                });
            } else {
                const existingSlot = doctorMap.get(docId).nearestSlot;
                const existingDate = new Date(existingSlot.slot_date);
                const newDate = new Date(slot.slot_date);
                if (newDate < existingDate ||
                    (newDate.getTime() === existingDate.getTime() && slot.start_time < existingSlot.start_time)) {
                    doctorMap.set(docId, {
                        doctor: slot.doctor,
                        nearestSlot: slot,
                        clinic: slot.clinic,
                    });
                }
            }
        }

        const result = Array.from(doctorMap.values());
        
        console.log('\nDoctors found:');
        result.forEach((item, index) => {
            console.log(`${index + 1}. ${item.doctor.full_name} - ${item.clinic.name} - ${item.nearestSlot.slot_date} ${item.nearestSlot.start_time}`);
        });

        // Kiểm tra xem có bác sĩ Đỗ Hoàng Nam không
        const doHoangNam = result.find(item => item.doctor.full_name.includes('Đỗ Hoàng Nam'));
        if (doHoangNam) {
            console.log('\n✅ Tìm thấy bác sĩ Đỗ Hoàng Nam!');
            console.log('Clinic:', doHoangNam.clinic.name);
            console.log('Slot:', doHoangNam.nearestSlot.slot_date, doHoangNam.nearestSlot.start_time);
        } else {
            console.log('\n❌ Không tìm thấy bác sĩ Đỗ Hoàng Nam');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testNewAPI(); 