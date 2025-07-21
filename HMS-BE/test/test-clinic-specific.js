const axios = require('axios');

async function testClinicSpecific() {
    try {
        console.log('=== TEST CLINIC SPECIFIC ===');
        
        const now = new Date();
        const after_date = now.toISOString().slice(0, 10);
        const after_time = now.toTimeString().slice(0, 8);
        
        // Test với clinic_id = 10 (Ung bướu - nơi có bác sĩ Đỗ Hoàng Nam)
        const url = `http://localhost:8080/api/v1/doctor/nearest-slot/10?after_date=${after_date}&after_time=${after_time}`;
        console.log('Testing URL:', url);
        
        const response = await axios.get(url);
        console.log('Response status:', response.status);
        
        const doctors = response.data.data || [];
        console.log('\nDoctors in clinic 10 (Ung bướu):');
        doctors.forEach((item, index) => {
            console.log(`${index + 1}. ${item.doctor.full_name} - ${item.clinic.name} - ${item.nearestSlot.slot_date} ${item.nearestSlot.start_time}`);
        });
        
        // Test với clinic_id = 1 (Tiêu hóa)
        const url2 = `http://localhost:8080/api/v1/doctor/nearest-slot/1?after_date=${after_date}&after_time=${after_time}`;
        console.log('\nTesting URL:', url2);
        
        const response2 = await axios.get(url2);
        console.log('Response status:', response2.status);
        
        const doctors2 = response2.data.data || [];
        console.log('\nDoctors in clinic 1 (Tiêu hóa):');
        doctors2.forEach((item, index) => {
            console.log(`${index + 1}. ${item.doctor.full_name} - ${item.clinic.name} - ${item.nearestSlot.slot_date} ${item.nearestSlot.start_time}`);
        });
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testClinicSpecific(); 