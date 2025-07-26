# Cấu hình Environment Variables trên Railway

## Các biến môi trường cần thiết:

### 1. Database
```
DATABASE_URL=mysql://username:password@host:port/database_name
```
*Railway sẽ tự động tạo khi bạn tạo MySQL database*

### 2. JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

### 3. Email Configuration (Nodemailer)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 5. VNPay Configuration
```
VNPAY_TMN_CODE=your-vnpay-tmn-code
VNPAY_HASH_SECRET=your-vnpay-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### 6. Server Configuration
```
PORT=8080
NODE_ENV=production
```

### 7. Frontend URL
```
FRONTEND_URL=https://your-frontend-app.vercel.app
```

## Cách thêm trên Railway Dashboard:

1. Vào project của bạn trên Railway
2. Chọn tab "Variables"
3. Click "New Variable"
4. Thêm từng biến một theo danh sách trên
5. Click "Add" để lưu

## Lưu ý:
- Đảm bảo FRONTEND_URL trỏ đến URL Vercel của bạn
- JWT_SECRET nên là một chuỗi ngẫu nhiên mạnh
- EMAIL_PASS là App Password từ Gmail (không phải password thường) 