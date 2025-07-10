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