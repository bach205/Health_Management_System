# Cập nhật Logic Slot trong Queue Service

## Vấn đề trước đây

Hàm `createOrderAndAssignToDoctorQueue` trước đây có logic sai khi tìm slot rảnh:
- Không ưu tiên slot cùng ngày với appointment hiện tại
- Không kiểm tra thời gian chuyển đổi hợp lý
- Có thể gán bệnh nhân vào slot đã qua thời gian
- Sử dụng OR condition với `start_time` gây lỗi Prisma khi so sánh DateTime với string

## Lý do thay đổi

1. **Yêu cầu nghiệp vụ:** Ưu tiên chuyển bệnh nhân trong cùng ngày để tiết kiệm thời gian
2. **Logic hợp lý:** Chỉ chuyển sau thời gian appointment hiện tại
3. **Tránh lỗi Prisma:** Xử lý so sánh thời gian ở application level

## Tại sao xử lý ở Application Level?

Prisma không thể so sánh trực tiếp `start_time` (DateTime) với string trong WHERE clause. Do đó:
- **Database level:** Chỉ lọc theo `slot_date` và `is_available`
- **Application level:** Lọc theo `start_time` để so sánh với `appointment_time`
- **Kết quả:** Logic chính xác mà không gây lỗi Prisma

## Logic mới

### 1. Điều kiện tìm slot rảnh với ưu tiên

```javascript
const now = new Date();
const appointmentDate = new Date(appointment.appointment_date);
const appointmentTime = appointment.appointment_time.toTimeString().slice(0, 8);
const currentTime = now.toTimeString().slice(0, 8);

let slot = null;

// Ưu tiên 1: Tìm slot cùng ngày với appointment, sau thời gian appointment
const sameDaySlots = await prisma.availableSlot.findMany({
  where: {
    doctor_id: to_doctor_id,
    clinic_id: to_clinic_id,
    is_available: true,
    slot_date: appointmentDate
  },
  orderBy: [
    { start_time: "asc" },
  ],
});

// Lọc slot cùng ngày có thời gian sau appointment (xử lý ở application level)
const validSameDaySlots = sameDaySlots.filter(slot => {
  const slotTime = slot.start_time.toTimeString().slice(0, 8);
  return slotTime > appointmentTime;
});

if (validSameDaySlots.length > 0) {
  slot = validSameDaySlots[0]; // Lấy slot gần nhất cùng ngày
} else {
  // Ưu tiên 2: Tìm slot trong tương lai (ngày khác)
  slot = await prisma.availableSlot.findFirst({
    where: {
      doctor_id: to_doctor_id,
      clinic_id: to_clinic_id,
      is_available: true,
      slot_date: { gt: appointmentDate } // Sau ngày appointment
    },
    orderBy: [
      { slot_date: "asc" },
      { start_time: "asc" },
    ],
  });
}
```

### 2. Logic chi tiết

**Ưu tiên 1: Slot cùng ngày**
- `slot_date = appointment.appointment_date`
- `start_time > appointment.appointment_time`
- Ưu tiên cao nhất để tiết kiệm thời gian

**Ưu tiên 2: Slot tương lai**
- `slot_date > appointment.appointment_date`
- Chỉ khi không có slot cùng ngày

### 3. Ví dụ thực tế

Giả sử bệnh nhân có appointment lúc 10:00 ngày 15/07/2025:

```
✅ Ưu tiên 1 (cùng ngày):
- 15/07/2025 14:00 (cùng ngày, sau 10:00)
- 15/07/2025 16:00 (cùng ngày, sau 10:00)

✅ Ưu tiên 2 (ngày khác):
- 16/07/2025 08:00 (ngày mai)
- 17/07/2025 09:00 (ngày kia)

❌ Không được chấp nhận:
- 15/07/2025 09:00 (cùng ngày, trước 10:00)
- 14/07/2025 15:00 (ngày hôm qua)
```

## Cải thiện

1. **Thêm logging chi tiết** để debug
2. **Thông báo lỗi rõ ràng hơn**
3. **Logic nhất quán** với các hàm khác
4. **Test case** để kiểm tra logic

## Test

Chạy test để kiểm tra logic:

```bash
cd HMS-BE
# Test logic cơ bản
node test/test-slot-logic.js

# Test logic ưu tiên
node test/test-priority-slot-logic.js

# Test hàm thực tế
node test/test-createOrderAndAssignToDoctorQueue.js
```

## Ảnh hưởng

- ✅ Bệnh nhân chỉ được gán vào slot hợp lệ
- ✅ Tránh tình trạng gán vào slot đã qua
- ✅ Logic rõ ràng và dễ hiểu
- ✅ Có thể mở rộng cho các trường hợp khác 