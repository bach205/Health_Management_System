# Hướng dẫn Deploy Backend từ GitLab lên Railway

## Bước 1: Cài đặt Railway CLI

```bash
npm install -g @railway/cli
```

## Bước 2: Đăng nhập Railway

```bash
railway login
```

## Bước 3: Tạo project trên Railway

```bash
railway init
```

## Bước 4: Kết nối với GitLab Repository

```bash
# Clone repository về local (nếu chưa có)
git clone <your-gitlab-repo-url>
cd <your-project-folder>

# Link với Railway project
railway link
```

## Bước 5: Cấu hình Environment Variables

Trên Railway Dashboard:
1. Vào project của bạn
2. Chọn tab "Variables"
3. Thêm các biến môi trường từ file env.example

## Bước 6: Deploy

```bash
railway up
```

## Bước 7: Tạo Database MySQL

1. Trên Railway Dashboard, click "New"
2. Chọn "Database" > "MySQL"
3. Railway sẽ tự động tạo DATABASE_URL
4. Copy DATABASE_URL và thêm vào Variables

## Bước 8: Chạy Migration

```bash
railway run npx prisma migrate deploy
```

## Bước 9: Generate Prisma Client

```bash
railway run npx prisma generate
```

## Bước 10: Deploy lại

```bash
railway up
```

## Lưu ý quan trọng:

1. **CORS Configuration**: Đã được cập nhật để sử dụng FRONTEND_URL
2. **Health Check**: Đã thêm endpoint /api/v1/health
3. **Database**: Sử dụng MySQL trên Railway
4. **Environment Variables**: Cần cấu hình đầy đủ trên Railway Dashboard 