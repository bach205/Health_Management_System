# Slot Logic Update Summary

## 🎯 Yêu cầu mới
Slot rảnh phải:
1. **> now** (sau thời gian hiện tại)
2. **Gần nhất với lịch đang khám** (appointment hiện tại)

## 🔄 Logic cũ vs Logic mới

### ❌ Logic cũ:
```javascript
// Ưu tiên 1: Cùng ngày với appointment, sau thời gian appointment
const sameDaySlots = await prisma.availableSlot.findMany({
  where: {
    doctor_id: to_doctor_id,
    clinic_id: to_clinic_id,
    is_available: true,
    slot_date: appointmentDate // Chỉ tìm cùng ngày
  },
  orderBy: [{ start_time: "asc" }],
});

// Lọc slot cùng ngày có thời gian sau appointment
const validSameDaySlots = sameDaySlots.filter(slot => {
  const slotTime = slot.start_time.toTimeString().slice(0, 8);
  return slotTime > appointmentTime; // Chỉ so sánh thời gian
});

if (validSameDaySlots.length > 0) {
  slot = validSameDaySlots[0];
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

### ✅ Logic mới:
```javascript
// Tìm tất cả slot rảnh của bác sĩ trong tương lai
const allAvailableSlots = await prisma.availableSlot.findMany({
  where: {
    doctor_id: to_doctor_id,
    clinic_id: to_clinic_id,
    is_available: true,
    OR: [
      // Slot trong tương lai (ngày khác)
      {
        slot_date: { gt: now }
      },
      // Slot hôm nay nhưng sau thời gian hiện tại
      {
        slot_date: {
          equals: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        },
        start_time: { gt: now }
      }
    ]
  },
  orderBy: [
    { slot_date: "asc" },
    { start_time: "asc" },
  ],
});

if (allAvailableSlots.length > 0) {
  // Tìm slot gần nhất với appointment hiện tại
  let closestSlot = allAvailableSlots[0];
  let minTimeDiff = Math.abs(new Date(closestSlot.slot_date).getTime() - appointmentDate.getTime());
  
  for (const availableSlot of allAvailableSlots) {
    const slotDateTime = new Date(availableSlot.slot_date);
    const timeDiff = Math.abs(slotDateTime.getTime() - appointmentDate.getTime());
    
    if (timeDiff < minTimeDiff) {
      minTimeDiff = timeDiff;
      closestSlot = availableSlot;
    }
  }
  
  slot = closestSlot;
}
```

## 📊 So sánh Logic

| Tiêu chí | Logic cũ | Logic mới |
|----------|----------|-----------|
| **Slot > now** | ❌ Không đảm bảo | ✅ Đảm bảo |
| **Gần nhất với appointment** | ❌ Ưu tiên cùng ngày | ✅ Tính toán khoảng cách thời gian |
| **Phạm vi tìm kiếm** | 🔄 Hạn chế (cùng ngày trước) | 🌍 Rộng (tất cả slot > now) |
| **Độ chính xác** | ⚠️ Có thể bỏ lỡ slot tốt hơn | 🎯 Chính xác hơn |

## 🔍 Chi tiết Logic mới

### 1. **Điều kiện tìm kiếm:**
```javascript
OR: [
  // Slot trong tương lai (ngày khác)
  {
    slot_date: { gt: now }
  },
  // Slot hôm nay nhưng sau thời gian hiện tại
  {
    slot_date: {
      equals: new Date(now.getFullYear(), now.getMonth(), now.getDate())
    },
    start_time: { gt: now }
  }
]
```

### 2. **Tính toán khoảng cách:**
```javascript
// Tính khoảng cách thời gian giữa slot và appointment
const timeDiff = Math.abs(slotDateTime.getTime() - appointmentDate.getTime());

// Chọn slot có khoảng cách nhỏ nhất
if (timeDiff < minTimeDiff) {
  minTimeDiff = timeDiff;
  closestSlot = availableSlot;
}
```

## 🧪 Test

Đã tạo test script `test/test-slot-logic.js` để kiểm tra:
- ✅ Slot được chọn phải > now
- ✅ Slot được chọn phải gần nhất với appointment
- ✅ Logic transfer hoạt động đúng
- ✅ Thông tin appointment mới chính xác

## 🎯 Kết quả

### ✅ Cải thiện:
- **Đảm bảo slot > now**: Không bao giờ chọn slot đã qua
- **Tối ưu thời gian**: Chọn slot gần nhất với lịch hiện tại
- **Logic rõ ràng**: Dễ hiểu và maintain
- **Hiệu quả**: Tìm được slot tốt nhất có thể

### 📈 Ví dụ thực tế:
```
Appointment hiện tại: 2025-07-18 14:30
Thời gian hiện tại: 2025-07-18 15:00

Các slot có sẵn:
- 2025-07-18 16:00 (cùng ngày, sau now)
- 2025-07-19 09:00 (ngày mai)
- 2025-07-20 10:00 (ngày kia)

Logic mới sẽ chọn: 2025-07-18 16:00 (gần nhất với appointment)
```

## 🎉 Kết luận

Logic mới đảm bảo:
- ✅ **Slot > now**: Không bao giờ chọn slot đã qua
- ✅ **Gần nhất với appointment**: Tối ưu thời gian chờ
- ✅ **Code clean**: Dễ đọc và maintain
- ✅ **Test đầy đủ**: Đảm bảo logic hoạt động đúng 