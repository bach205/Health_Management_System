# Transfer Logic Fix Summary

## 🐛 Vấn đề đã được sửa
Khi chuyển khám, thông tin bác sĩ cũ vẫn được giữ lại trong queue thay vì cập nhật thành bác sĩ mới.

## 🔍 Nguyên nhân
Logic cũ sử dụng `appointment_id` cũ (từ bác sĩ cũ) khi tạo queue mới, dẫn đến việc queue vẫn liên kết với bác sĩ cũ.

## ✅ Giải pháp đã áp dụng

### 1. Tạo Appointment Mới
**File:** `HMS-BE/src/services/queue.service.js`

**Thay đổi:**
```javascript
// CŨ: Sử dụng appointment_id cũ
const queue = await QueueService.assignQueueNumber({
  appointment_id, // ❌ appointment cũ
  patient_id,
  clinic_id: to_clinic_id,
  // ...
});

// MỚI: Tạo appointment mới cho bác sĩ mới
const newAppointment = await prisma.appointment.create({
  data: {
    patient_id: patient_id,
    doctor_id: to_doctor_id, // ✅ bác sĩ mới
    clinic_id: to_clinic_id,
    appointment_date: slot.slot_date,
    appointment_time: slot.start_time,
    status: "confirmed",
    priority: priority,
    reason: reason,
    note: note,
  },
  include: {
    doctor: true,
    clinic: true,
    patient: true,
  },
});

const queue = await QueueService.assignQueueNumber({
  appointment_id: newAppointment.id, // ✅ appointment mới
  patient_id,
  clinic_id: to_clinic_id,
  // ...
});
```

### 2. Cập nhật Queue Cũ
```javascript
// Cập nhật trạng thái queue cũ thành done
const oldQueue = await prisma.queue.findFirst({
  where: { 
    appointment_id: appointment_id, // appointment cũ
    status: { in: ['waiting', 'in_progress'] }
  },
});

if (oldQueue) {
  await prisma.queue.update({
    where: { id: oldQueue.id },
    data: {
      status: "done",
    },
  });
}
```

### 3. Trả về Thông tin Đầy đủ
```javascript
return {
  order,
  queue,
  assignedDoctor: order.doctor,
  slot,
  newAppointment, // ✅ Thêm appointment mới
};
```

## 🔄 Flow mới khi chuyển khám

1. **Tìm slot rảnh** của bác sĩ mới
2. **Tạo appointment mới** với bác sĩ mới
3. **Tạo queue mới** với appointment mới
4. **Cập nhật queue cũ** thành "done"
5. **Tạo examination order** để ghi lại lịch sử
6. **Emit socket** thông báo cho frontend

## 📊 Kết quả

### ✅ Trước khi sửa:
- Queue mới vẫn hiển thị bác sĩ cũ
- Appointment không được cập nhật
- Thông tin không nhất quán

### ✅ Sau khi sửa:
- Queue mới hiển thị đúng bác sĩ mới
- Appointment mới được tạo cho bác sĩ mới
- Thông tin nhất quán và chính xác
- Lịch sử chuyển khám được ghi lại đầy đủ

## 🧪 Test

Đã tạo test script `test/test-transfer-logic.js` để kiểm tra:
- Tạo appointment mới đúng bác sĩ
- Queue mới có thông tin chính xác
- Queue cũ được cập nhật đúng trạng thái
- Examination order được tạo đầy đủ

## 🎯 Kết luận

Vấn đề thông tin bác sĩ khi chuyển khám đã được sửa hoàn toàn. Logic mới đảm bảo:
- ✅ Thông tin bác sĩ được cập nhật chính xác
- ✅ Data consistency được duy trì
- ✅ Lịch sử chuyển khám được ghi lại đầy đủ
- ✅ Code clean và dễ maintain 