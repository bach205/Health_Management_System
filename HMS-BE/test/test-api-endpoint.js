const axios = require('axios');

async function testAPIEndpoint() {
    try {
        console.log('=== TEST API ENDPOINT ===');
        
        const now = new Date();
        const after_date = now.toISOString().slice(0, 10);
        const after_time = now.toTimeString().slice(0, 8);
        
        console.log('Current date:', after_date);
        console.log('Current time:', after_time);
        
        // Test với clinic_id = 1
        const url = `http://localhost:8080/api/v1/doctor/nearest-slot/1?after_date=${after_date}&after_time=${after_time}`;
        console.log('Testing URL:', url);
        
        const response = await axios.get(url);
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        // Kiểm tra xem có bác sĩ Đỗ Hoàng Nam không
        const doctors = response.data.data || [];
        const doHoangNam = doctors.find((item) => 
            item.doctor.full_name.includes('Đỗ Hoàng Nam')
        );
        
        if (doHoangNam) {
            console.log('\n✅ Tìm thấy bác sĩ Đỗ Hoàng Nam!');
            console.log('Clinic:', doHoangNam.clinic?.name);
            console.log('Slot:', doHoangNam.nearestSlot?.slot_date, doHoangNam.nearestSlot?.start_time);
        } else {
            console.log('\n❌ Không tìm thấy bác sĩ Đỗ Hoàng Nam');
            console.log('Available doctors:', doctors.map((d) => d.doctor.full_name));
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testAPIEndpoint(); 