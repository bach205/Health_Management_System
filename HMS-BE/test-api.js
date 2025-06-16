const axios = require('axios');

// Cấu hình endpoint và ID thực tế từ database mẫu
const API_URL = 'http://localhost:8080/api/v1';
const TEST_CONFIG = {
  doctor_id: 2,    // Bác sĩ Trần Thị B
  clinic_id: 1,    // Phòng khám tim mạch
  patient_id: 8,   // Bệnh nhân 1 (patient1@example.com)
  nurse_id: 4,     // Y tá 2 (user_id = 4)
};

// Helper: Lấy slot còn trống cho bác sĩ/phòng/ngày
async function getAvailableSlot() {
  const res = await axios.get(`${API_URL}/appointment/slots`, {
    params: {
      doctor_id: TEST_CONFIG.doctor_id,
      clinic_id: TEST_CONFIG.clinic_id,
      appointment_date: '2025-06-15', // Ngày có slot trống theo db mẫu
    }
  });
  // Lấy slot đầu tiên còn trống
  return res.data.data.find(slot => slot.is_available);
}

// Đặt lịch thường
async function testNormalBooking(slot) {
  // Đảm bảo đúng định dạng ngày và giờ
  const dateStr = slot.slot_date.split('T')[0]; // 'YYYY-MM-DD'
  const timeStr = slot.start_time.slice(11, 19); // 'HH:mm:ss'
  const payload = {
    patient_id: TEST_CONFIG.patient_id,
    doctor_id: TEST_CONFIG.doctor_id,
    clinic_id: TEST_CONFIG.clinic_id,
    appointment_date: dateStr,
    appointment_time: timeStr,
    reason: "Test đặt lịch thường",
    note: "Test API booking thường"
  };
  console.log('Payload đặt lịch thường:', payload);
  const res = await axios.post(`${API_URL}/appointment/book`, payload);
  return res.data.data;
}

// Đặt lịch qua y tá (ưu tiên cao hơn)
async function testNurseBooking(slot) {
  const dateStr = slot.slot_date.split('T')[0];
  const timeStr = slot.start_time.slice(11, 19);
  const payload = {
    patient_id: TEST_CONFIG.patient_id,
    doctor_id: TEST_CONFIG.doctor_id,
    clinic_id: TEST_CONFIG.clinic_id,
    appointment_date: dateStr,
    appointment_time: timeStr,
    reason: "Test đặt lịch qua y tá",
    note: "Test API booking nurse"
  };
  console.log('Payload đặt lịch nurse:', payload);
  const res = await axios.post(`${API_URL}/appointment/nurse-book`, payload);
  return res.data.data;
}

// Check-in vào queue
async function testCheckIn(appointment_id) {
  const res = await axios.post(`${API_URL}/queue/checkin`, {
    appointment_id
  });
  return res.data.data;
}

// Gọi số tiếp theo và skip
async function testCallAndSkip() {
  // Gọi số tiếp theo
  const callRes = await axios.post(`${API_URL}/queue/call-next`, {
    clinic_id: TEST_CONFIG.clinic_id
  });
  const queue = callRes.data.data;
  // Đánh dấu vắng mặt
  const skipRes = await axios.patch(`${API_URL}/queue/${queue.id}/status`, {
    status: 'skipped'
  });
  return { called: queue, skipped: skipRes.data.data };
}

// Chuyển phòng khám
async function testTransferClinic() {
  // Giả sử đã có record_id, ở đây test chuyển từ phòng 1 sang phòng 2
  const res = await axios.post(`${API_URL}/examination-detail/`, {
    patient_id: TEST_CONFIG.patient_id,
    clinic_id: TEST_CONFIG.clinic_id,
    doctor_id: TEST_CONFIG.doctor_id,
    from_clinic_id: TEST_CONFIG.clinic_id,
    to_clinic_id: 2, // Chuyển sang phòng Thần kinh
    result: "Cần chuyển phòng để khám chuyên sâu",
    status: "pending",
    examined_at: new Date(),
  });
  return res.data.data;
}

// Hủy lịch hẹn
async function testCancelAppointment(appointment_id) {
  const res = await axios.post(`${API_URL}/appointment/cancel`, {
    appointment_id,
    reason: "Bệnh nhân hủy lịch"
  });
  return res.data.data;
}

// Chạy toàn bộ test
async function runTests() {
  try {
    console.log("=== BẮT ĐẦU TEST ===\n");

    // 1. Lấy slot còn trống
    const slot = await getAvailableSlot();
    if (!slot) throw new Error('Không còn slot trống để test!');
    console.log("Slot còn trống:", slot);

    // 2. Đặt lịch thường
    const normalAppointment = await testNormalBooking(slot);
    console.log("✓ Đặt lịch thường thành công:", normalAppointment);

    // 3. Đặt lịch qua y tá (ưu tiên cao hơn, cùng slot)
    const nurseAppointment = await testNurseBooking(slot);
    console.log("✓ Đặt lịch qua y tá thành công:", nurseAppointment);

    // 4. Check-in vào queue từ lịch thường
    const checkin = await testCheckIn(normalAppointment.id);
    console.log("✓ Check-in queue thành công:", checkin);

    // 5. Gọi số và skip
    const callSkip = await testCallAndSkip();
    console.log("✓ Gọi số:", callSkip.called);
    console.log("✓ Đánh dấu vắng mặt:", callSkip.skipped);

    // 6. Chuyển phòng khám
    const transfer = await testTransferClinic();
    console.log("✓ Chuyển phòng thành công:", transfer);

    // 7. Hủy lịch hẹn nurse
    const cancel = await testCancelAppointment(nurseAppointment.id);
    console.log("✓ Hủy lịch hẹn nurse thành công:", cancel);

    console.log("\n=== KẾT THÚC TEST ===");
  } catch (err) {
    if (err.response) {
      console.error("❌ Lỗi:", err.response.data);
    } else {
      console.error("❌ Lỗi:", err.message);
    }
  }
}

runTests();