# Functional Requirements Screenshots

## User Authentication

### User Register
![User Register](images/user_register.png)

### User Login
![User Login](images/user_login.png)

### Change Password
![Change Password](images/change_password.png)

### User Profile Updating
![User Profile Updating](images/user_profile_updating.png)

### Login with Google
![Login with Google](images/login_google.png)

### Reset Password
![Reset Password](images/reset_password.png)

---

## System Administration

### Doctor Management
![Doctor Management](images/doctor_management.png)

### Nurse Management
![Nurse Management](images/nurse_management.png)

### Specialty Management
![Specialty Management](images/specialty_management.png)

### Medicine Management
![Medicine Management](images/medicine_management.png)

### Dashboard
![Dashboard](images/dashboard.png)


---

## Appointment Management

### Patient Search Doctor
![Patient Search Doctor](images/patient_search_doctor.png)


### Booking Appointment
![Booking Appointment](images/booking_appointment.png)

### Appointment Management
![Appointment Management](images/appointment_management.png)

### System Send Queue Number to Patient via Email
![System Send Queue Number](images/system_send_queue.png)

### Appointment history
![Patient view all their appointment ](images/Patient_history_of_appointment.png)

---

## Customer Support

### Chatbot for Customer Support
![Chatbot for Customer Support](images/chatbot_support.png)

---

## Communication & Document

### Conversation Management
![Conversation Management](images/conversation_management.png)

### Document Management
![Document Management](images/document_management.png)

---

## Examination

### Queue Management
![Queue Management](images/queue_management.png)

### Clinic Monitor
![Clinic Monitor](images/clinic_monitor.png)

### Notification
![Notification](images/notification.png)

### Examination Result and Feedback
![Examination Feedback](images/exam_result_feedback.png)
![Examination Result](images/exam_result.png)

### Payment
![Payment](images/payment.png)

---

## Blog

### Blog Category Management
![Blog Category Management](images/blog_category.png)

### Blog Management
![Blog Management](images/blog_management.png)

# Hospital Management System (HMS)

Hệ thống quản lý bệnh viện gồm 3 thành phần chính:
- **HMS-BE**: Backend (Node.js, Express, Prisma, MySQL)
- **HMS-FE**: Frontend (React, Vite)
- **Rag-Server**: AI RAG Server (Python, LLM, v.v.)

---

## 1. HMS-BE (Backend)

### Cài đặt
```bash
npm install
```

### Chạy server phát triển
```bash
npm run dev
```

### Chạy server production
```bash
npm start
```

- Cấu hình kết nối DB trong `.env` (tham khảo `.env.example`).
- Sử dụng Prisma để migrate database:
```bash
npx prisma migrate dev
```

---

## 2. HMS-FE (Frontend)

### Cài đặt
```bash
npm install
```

### Chạy server phát triển
```bash
npm run dev
```

- Mặc định FE chạy ở `http://localhost:5173`.
- Cấu hình endpoint API trong file `.env` nếu cần.

---

## 3. Rag-Server (AI RAG)

- **Lưu ý:** Rag-Server có hướng dẫn riêng, vui lòng xem chi tiết tại:
  - [`Rag-Server/README.md`](./Rag-Server/README.md)

---

## Thông tin khác
- Để biết chi tiết về các API (ví dụ: feedback, appointment, ...), xem tài liệu API hoặc liên hệ team backend.
- Đảm bảo đã cài đặt Node.js >= 18, npm >= 9, MySQL >= 8.0.

---

**Mọi thắc mắc vui lòng liên hệ team phát triển dự án.**  