CREATE DATABASE hospital;
USE hospital;

-- Bảng người dùng hệ thống
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính của người dùng',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email đăng nhập, duy nhất',
    password_hash VARCHAR(255) COMMENT 'Mã hóa mật khẩu (nếu dùng local)',
    full_name VARCHAR(255) COMMENT 'Tên đầy đủ',
    date_of_birth DATE COMMENT 'Ngày sinh',
	gender ENUM('male', 'female', 'other') COMMENT 'Giới tính',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
	address TEXT COMMENT 'Địa chỉ liên hệ',
    role ENUM('doctor', 'nurse', 'receptionist', 'admin', 'patient') NOT NULL COMMENT 'Vai trò người dùng',
    sso_provider ENUM('google', 'facebook', 'local') DEFAULT 'local' COMMENT 'Nguồn xác thực',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động của tài khoản',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật'
);

ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(255);

-- Bệnh nhân
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính bệnh nhân',
    identity_number VARCHAR(50) COMMENT 'CCCD/BHYT nếu có',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày đăng ký',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Cập nhật gần nhất'
);

-- Phòng khám
CREATE TABLE clinics (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã phòng khám',
    name VARCHAR(255) NOT NULL COMMENT 'Tên chuyên khoa',
    description TEXT COMMENT 'Mô tả phòng khám'
);

-- Thông tin mở rộng từ user (bác sĩ)
CREATE TABLE doctors (
    user_id INT PRIMARY KEY COMMENT 'Tham chiếu đến users(id)',
    specialty VARCHAR(255) COMMENT 'Chuyên môn',
    bio TEXT COMMENT 'Giới thiệu',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ca làm việc
CREATE TABLE shifts (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID ca làm',
    name VARCHAR(100) COMMENT 'Tên ca (VD: sáng, chiều)',
    start_time TIME COMMENT 'Giờ bắt đầu',
    end_time TIME COMMENT 'Giờ kết thúc'
);

-- Lịch làm việc của nhân sự
CREATE TABLE work_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID lịch làm việc',
    user_id INT NOT NULL COMMENT 'Người làm việc (doctor/nurse)',
    clinic_id INT NOT NULL COMMENT 'Phòng khám',
    work_date DATE NOT NULL COMMENT 'Ngày làm việc',
    shift_id INT NOT NULL COMMENT 'Ca làm cụ thể',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Yêu cầu khám phòng khác
CREATE TABLE examination_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL COMMENT 'Bác sĩ chỉ định',
    patient_id INT NOT NULL COMMENT 'Bệnh nhân',
    from_clinic_id INT NOT NULL COMMENT 'Phòng hiện tại',
    to_clinic_id INT NOT NULL COMMENT 'Phòng chuyển đến',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT 'Tổng chi phí dự kiến của đợt khám',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (from_clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (to_clinic_id) REFERENCES clinics(id)
);

-- Hồ sơ khám tổng quát
CREATE TABLE examination_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL COMMENT 'Bệnh nhân',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian bắt đầu hồ sơ khám',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Cập nhật hồ sơ',
    symptoms TEXT COMMENT 'Triệu chứng ban đầu',
    primary_doctor_id INT COMMENT 'Bác sĩ tổng kết',
    final_diagnosis TEXT COMMENT 'Chẩn đoán cuối cùng',
    created_by_user_id INT COMMENT 'Người tạo hồ sơ khám (nếu khác bệnh nhân)',
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (primary_doctor_id) REFERENCES users(id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

-- Chi tiết khám từng phòng
CREATE TABLE examination_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL COMMENT 'Hồ sơ khám tổng',
    clinic_id INT NOT NULL COMMENT 'Phòng khám cụ thể',
    doctor_id INT NOT NULL COMMENT 'Bác sĩ khám phòng',
    result TEXT COMMENT 'Kết quả khám',
    note TEXT COMMENT 'Ghi chú thêm',
    examined_at DATETIME COMMENT 'Thời gian hoàn thành khám',
    status ENUM('pending', 'in_progress', 'done', 'cancelled') DEFAULT 'pending' COMMENT 'Trạng thái khám',
    FOREIGN KEY (record_id) REFERENCES examination_records(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Hàng đợi bệnh nhân
CREATE TABLE queues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinic_id INT NOT NULL,
    record_id INT COMMENT 'Hồ sơ khám liên quan (nếu có)',
    status ENUM('waiting', 'in_progress', 'done', 'skipped') DEFAULT 'waiting' COMMENT 'Trạng thái trong hàng đợi',
    priority TINYINT DEFAULT 0 COMMENT 'Ưu tiên (0 thấp - 10 cao)',
    registered_online BOOLEAN DEFAULT FALSE COMMENT 'Đăng ký qua mạng hay không',
    qr_code VARCHAR(255) COMMENT 'Mã QR checkin',
    called_at DATETIME COMMENT 'Thời điểm được gọi vào',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (record_id) REFERENCES examination_records(id)
);

-- Đơn thuốc tổng
CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL COMMENT 'Liên kết hồ sơ khám',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES examination_records(id)
);

-- Chi tiết thuốc
CREATE TABLE prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL COMMENT 'Thuộc đơn nào',
    medicine_name VARCHAR(255) NOT NULL COMMENT 'Tên thuốc',
    dosage VARCHAR(100) COMMENT 'Liều lượng',
    frequency VARCHAR(100) COMMENT 'Số lần uống mỗi ngày',
    duration VARCHAR(100) COMMENT 'Thời gian sử dụng',
    note TEXT COMMENT 'Ghi chú bác sĩ',
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

-- Bảng thông tin thanh toán
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL COMMENT 'Người thanh toán',
    record_id INT COMMENT 'Liên kết hồ sơ khám (nếu có)',
    amount DECIMAL(10,2) NOT NULL COMMENT 'Số tiền thanh toán',
    method ENUM('cash', 'card', 'bank_transfer', 'e_wallet') COMMENT 'Phương thức thanh toán',
    payment_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm thanh toán',
    note TEXT COMMENT 'Ghi chú (VD: đợt thanh toán, hoàn tiền, bổ sung)',
    is_refund BOOLEAN DEFAULT FALSE COMMENT 'Có phải hoàn tiền không',
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (record_id) REFERENCES examination_records(id)
);

-- Bảng này dùng để ghi nhận số dư hiện tại, hỗ trợ kiểm soát bệnh nhân còn nợ hay còn dư tiền để trừ tiếp/bổ sung.
CREATE TABLE payment_balances (
    patient_id INT PRIMARY KEY COMMENT 'Khóa chính là bệnh nhân',
    balance DECIMAL(10,2) DEFAULT 0 COMMENT 'Số dư (âm nếu còn nợ)',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Chi tiết từng khoản phí theo lượt khám
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL COMMENT 'Liên kết hồ sơ khám',
    description TEXT COMMENT 'Mô tả phí (khám, xét nghiệm, thuốc...)',
    amount DECIMAL(10,2) NOT NULL COMMENT 'Chi phí mục này',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES examination_records(id)
);

INSERT INTO users (
    email,
    password,
    full_name,
    phone,
    role,
    date_of_birth,
    gender,
    address,
    sso_provider,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@example.com',
    '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2',  -- admin123
    'Admin',
    '0123456789',
    'admin', -- hoặc 'admin' nếu enum có
    '1990-01-01',
    'other',
    'Hanoi',
    'local',
    1,
    NOW(),
    NOW()
);

-- Insert bảng user
-- pasword là password123
INSERT INTO users (email, password, full_name, phone, role, date_of_birth, gender, address, sso_provider, is_active) VALUES
('doctor1@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Văn A', '0987654321', 'doctor', '1985-03-15', 'male', 'Hà Nội', 'local', TRUE),
('doctor2@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Trần Thị B', '0987654322', 'doctor', '1988-07-22', 'female', 'TP.HCM', 'local', TRUE),
('nurse1@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Lê Văn C', '0987654323', 'nurse', '1990-11-10', 'male', 'Đà Nẵng', 'local', TRUE),
('nurse2@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Phạm Thị D', '0987654324', 'nurse', '1992-04-05', 'female', 'Hà Nội', 'local', TRUE),
('receptionist1@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Hoàng Văn E', '0987654325', 'receptionist', '1995-09-12', 'male', 'TP.HCM', 'local', TRUE),
('receptionist2@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Vũ Thị F', '0987654326', 'receptionist', '1993-12-20', 'female', 'Đà Nẵng', 'local', TRUE),
('admin2@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Thị G', '0987654327', 'admin', '1980-06-30', 'female', 'Hà Nội', 'local', TRUE),
('patient1@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Trần Văn H', '0987654328', 'patient', '1998-02-14', 'male', 'TP.HCM', 'google', TRUE),
('patient2@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Lê Thị I', '0987654329', 'patient', '1996-08-25', 'female', 'Hà Nội', 'local', TRUE),
('patient3@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Phạm Văn J', '0987654330', 'patient', '1990-05-17', 'male', 'Đà Nẵng', 'facebook', TRUE),
('patient4@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Hoàng Thị K', '0987654331', 'patient', '1987-03-09', 'female', 'TP.HCM', 'local', TRUE),
('patient5@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Vũ Văn L', '0987654332', 'patient', '1994-10-01', 'male', 'Hà Nội', 'google', TRUE),
('patient6@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Thị M', '0987654333', 'patient', '1999-07-07', 'female', 'Đà Nẵng', 'local', TRUE),
('doctor3@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Trần Văn N', '0987654334', 'doctor', '1983-01-25', 'male', 'TP.HCM', 'local', TRUE),
('nurse3@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Lê Thị O', '0987654335', 'nurse', '1991-06-15', 'female', 'Hà Nội', 'local', TRUE);

-- Alter table user
UPDATE users SET sso_provider = 'local' WHERE email = 'patient1@example.com';
UPDATE users SET password = '$2b$10$WmOLM2QL2s5Y3QYTum5kJOQN9jIfBIjjIP71lxDedBLEsUO5bmFU2' WHERE email = 'doctor1@example.com';
UPDATE users SET password = '$2b$10$lDLp1RH5ZZ.tJ3MwjJZjMuEvK8oJfdIk4o9MMxLxlPmikyj.P3muK' WHERE email = 'doctor2@example.com';
UPDATE users SET password = '$2b$10$DWhHRcJ6oWS.X/Yh9DEkAOsB2Vg9uAQmbaC667MhBZnGxeahklRXe' WHERE email = 'nurse1@example.com';
UPDATE users SET password = '$2b$10$SJupulIuCV59ERzfYZqAxeVmXJ6cqOgAhwza.zjiRcZUd0XmMZsCW' WHERE email = 'nurse2@example.com';
UPDATE users SET password = '$2b$10$YtadcrWr4QG9tW8xHqgxweSA1FKEmkJd.p8doH6wVllr4NiUWHt..' WHERE email = 'receptionist1@example.com';
UPDATE users SET password = '$2b$10$C8XYHl53FkSxrLfh4Dqace.Kh5S7ZuFegCg3O9xl5cbjZoPw741ge' WHERE email = 'receptionist2@example.com';
UPDATE users SET password = '$2b$10$Nvu5M9kmqS5jWifY8a/JUeeR6IjLZ4.lmawLLJfcOfEHwaUkqPv0a' WHERE email = 'admin2@example.com';
UPDATE users SET password = '$2b$10$GxnPuU4OqeCml44HiYk/heRKFk8h0AbY/qM6rmc0A7mrQ4883Elmq' WHERE email = 'patient1@example.com';
UPDATE users SET password = '$2b$10$UbIucGc/ZC6mIkCGP7CCjuESGDoq1PMGSyDzD0K3UQ3XGd.whndxK' WHERE email = 'patient2@example.com';
UPDATE users SET password = '$2b$10$W3olOAm.7geI1AY9648vDOUcp/rosMdoWYV1uXeIVd8p9DLwePCzm' WHERE email = 'patient3@example.com';
UPDATE users SET password = '$2b$10$YJ49PgM.igiHDjkBqZO/zOR.K.V9cOd.it3hoMqw10rDsgSPz9zVO' WHERE email = 'patient4@example.com';
UPDATE users SET password = '$2b$10$3OuIqvhF/R0OgNScZhcCEO9P02jHNhFat2ClD.4VB77dxl5QT9yOG' WHERE email = 'patient5@example.com';
UPDATE users SET password = '$2b$10$DrvOTxC7TE8HM2oIBtF52u36y.8FpDMnb.FFOpy72srPpAGRWw5EO' WHERE email = 'patient6@example.com';
UPDATE users SET password = '$2b$10$DrUljwk8Amt2CYCG9N3JWejWeMp3k2bIgxG.zPvwSVlyJY7g1wXL2' WHERE email = 'doctor3@example.com';
UPDATE users SET password = '$2b$10$vkB5NNh89QrcCfKthf2Xy.B7FViJFW4guWQGJ.91K2aC8yc965a0y' WHERE email = 'nurse3@example.com';

-- Insert bảng patient
INSERT INTO patients (id, identity_number) VALUES
(8, '123456789001'),  -- Liên kết với patient1@example.com
(9, '123456789002'),  -- Liên kết với patient2@example.com
(10, '123456789003'), -- Liên kết với patient3@example.com
(11, '123456789004'), -- Liên kết với patient4@example.com
(12, '123456789005'), -- Liên kết với patient5@example.com
(13, '123456789006'); -- Liên kết với patient6@example.com

INSERT INTO patients (id, identity_number) VALUES
(14, '123456789007'),
(15, '123456789008'),
(16, '123456789009'),
(17, '123456789010'),
(18, '123456789011'),
(19, '123456789012'),
(20, '123456789013'),
(21, '123456789014'),
(22, '123456789015');

-- Insert bảng clinics
INSERT INTO clinics (name, description) VALUES
('Tim mạch', 'Chuyên về các bệnh liên quan đến tim'),
('Thần kinh', 'Chuyên về các rối loạn hệ thần kinh'),
('Chấn thương chỉnh hình', 'Chuyên về xương và khớp'),
('Nhi khoa', 'Chuyên chăm sóc sức khỏe trẻ em'),
('Da liễu', 'Chuyên về các bệnh về da'),
('Mắt', 'Chuyên chăm sóc mắt'),
('Tai mũi họng', 'Chuyên về tai, mũi và họng'),
('Nội tổng quát', 'Dịch vụ chăm sóc sức khỏe tổng quát'),
('Chẩn đoán hình ảnh', 'Dịch vụ chẩn đoán hình ảnh'),
('Ung bướu', 'Điều trị và chăm sóc bệnh ung thư'),
('Tiêu hóa', 'Rối loạn hệ tiêu hóa'),
('Tiết niệu', 'Hệ tiết niệu và sinh sản nam'),
('Nội tiết', 'Rối loạn liên quan đến hormone');

-- Insert bảng doctors
INSERT INTO doctors (user_id, specialty, bio) VALUES
(1, 'Tim mạch', 'Bác sĩ tim mạch với 10 năm kinh nghiệm'),
(2, 'Thần kinh', 'Chuyên gia về rối loạn thần kinh'),
(14, 'Chấn thương chỉnh hình', 'Chuyên gia phẫu thuật thay khớp'),
(3, 'Nhi khoa', 'Chuyên gia chăm sóc trẻ em'),
(4, 'Da liễu', 'Chuyên gia chăm sóc da với 8 năm kinh nghiệm'),
(5, 'Mắt', 'Chuyên gia phẫu thuật mắt'),
(6, 'Tai mũi họng', 'Chuyên gia về tai, mũi và họng'),
(7, 'Nội tổng quát', 'Bác sĩ đa khoa'),
(8, 'Chẩn đoán hình ảnh', 'Chuyên gia chẩn đoán hình ảnh'),
(9, 'Ung bướu', 'Chuyên gia điều trị ung thư'),
(10, 'Tiêu hóa', 'Chuyên gia hệ tiêu hóa'),
(11, 'Tiết niệu', 'Chuyên gia tiết niệu và sức khỏe sinh sản nam'),
(12, 'Nội tiết', 'Chuyên gia rối loạn hormone');

-- Insert bảng shifts
INSERT INTO shifts (name, start_time, end_time) VALUES
('Sáng', '08:00:00', '12:00:00'),
('Chiều', '13:00:00', '17:00:00'),
('Tối', '18:00:00', '22:00:00'),
('Đêm', '22:00:00', '06:00:00'),
('Cả ngày', '08:00:00', '17:00:00'),
('Sáng sớm', '06:00:00', '10:00:00'),
('Chiều muộn', '15:00:00', '19:00:00'),
('Giữa trưa', '10:00:00', '14:00:00'),
('Đêm muộn', '00:00:00', '08:00:00'),
('Sáng cuối tuần', '09:00:00', '13:00:00');

-- Insert bảng work_schedules
INSERT INTO work_schedules (user_id, clinic_id, work_date, shift_id) VALUES
(1, 1, '2025-06-03', 1), -- Bác sĩ 1, Tim mạch, Sáng
(2, 2, '2025-06-03', 2), -- Bác sĩ 2, Thần kinh, Chiều
(3, 4, '2025-06-03', 1), -- Y tá 1, Nhi khoa, Sáng
(4, 5, '2025-06-03', 3), -- Y tá 2, Da liễu, Tối
(14, 3, '2025-06-04', 1), -- Bác sĩ 3, Chấn thương chỉnh hình, Sáng
(5, 6, '2025-06-04', 2), -- Lễ tân 1, Mắt, Chiều
(6, 7, '2025-06-04', 3), -- Lễ tân 2, Tai mũi họng, Tối
(7, 8, '2025-06-05', 1), -- Quản trị viên 2, Nội tổng quát, Sáng
(8, 9, '2025-06-05', 2), -- Bệnh nhân 1, Chẩn đoán hình ảnh, Chiều
(9, 10, '2025-06-05', 3), -- Bệnh nhân 2, Ung bướu, Tối
(10, 11, '2025-06-06', 1), -- Bệnh nhân 3, Tiêu hóa, Sáng
(11, 12, '2025-06-06', 2), -- Bệnh nhân 4, Tiết niệu, Chiều
(12, 13, '2025-06-06', 3); -- Bệnh nhân 5, Nội tiết, Tối

-- Insert bảng examination_orders
INSERT INTO examination_orders (doctor_id, patient_id, from_clinic_id, to_clinic_id, total_cost) VALUES
(1, 8, 1, 2, 150.00),
(2, 9, 2, 3, 200.00),
(14, 10, 3, 4, 180.00),
(1, 11, 1, 5, 120.00),
(2, 12, 2, 6, 130.00),
(3, 13, 4, 7, 100.00),
(4, 14, 5, 8, 160.00),
(5, 15, 6, 9, 170.00),
(6, 16, 7, 10, 190.00),
(7, 17, 8, 11, 140.00),
(8, 18, 9, 12, 110.00),
(9, 19, 10, 13, 200.00),
(10, 20, 11, 1, 150.00);

-- Insert bảng examination_records
INSERT INTO examination_records (patient_id, symptoms, primary_doctor_id, final_diagnosis, created_by_user_id) VALUES
(8, 'Đau ngực', 1, 'Đau thắt ngực ổn định', 5),
(9, 'Đau đầu', 2, 'Đau nửa đầu', 6),
(10, 'Đau khớp', 14, 'Viêm khớp', 5),
(11, 'Phát ban da', 4, 'Chàm', 6),
(12, 'Vấn đề thị lực', 5, 'Cận thị', 5),
(13, 'Đau họng', 6, 'Viêm amidan', 6),
(14, 'Mệt mỏi', 7, 'Thiếu máu', 5),
(15, 'X-quang bất thường', 8, 'Viêm phổi', 6),
(16, 'Sụt cân', 9, 'Nghi ngờ ung thư', 5),
(17, 'Đau bụng', 10, 'Viêm dạ dày', 6),
(18, 'Vấn đề tiết niệu', 11, 'Nhiễm trùng đường tiết niệu', 5),
(19, 'Mệt mỏi', 12, 'Suy giáp', 6),
(20, 'Khó chịu ngực', 1, 'Tiếng thổi tim', 5);


-- Insert bảng examnination_details
INSERT INTO examination_details (record_id, clinic_id, doctor_id, result, note, examined_at, status) VALUES
(1, 1, 1, 'Điện tâm đồ bình thường', 'Theo dõi triệu chứng', '2025-06-03 09:00:00', 'done'),
(2, 2, 2, 'MRI bình thường', 'Kê đơn giảm đau', '2025-06-03 14:00:00', 'done'),
(3, 3, 14, 'X-quang cho thấy viêm', 'Vật lý trị liệu', '2025-06-04 10:00:00', 'done'),
(4, 5, 4, 'Đã sinh thiết da', 'Chờ kết quả', '2025-06-04 15:00:00', 'in_progress'),
(5, 6, 5, 'Kê kính chỉnh thị', 'Tái khám sau 6 tháng', '2025-06-05 11:00:00', 'done'),
(6, 7, 6, 'Kê kháng sinh', 'Nghỉ ngơi', '2025-06-05 16:00:00', 'done'),
(7, 8, 7, 'Yêu cầu xét nghiệm máu', 'Kiểm tra mức sắt', '2025-06-06 09:00:00', 'pending'),
(8, 9, 8, 'Đã hoàn thành CT', 'Cần xét nghiệm thêm', '2025-06-06 14:00:00', 'in_progress'),
(9, 10, 9, 'Lên lịch sinh thiết', 'Khẩn cấp', '2025-06-07 10:00:00', 'pending'),
(10, 11, 10, 'Đã nội soi', 'Khuyên thay đổi chế độ ăn', '2025-06-07 15:00:00', 'done'),
(11, 12, 11, 'Xét nghiệm nước tiểu dương tính', 'Kê kháng sinh', '2025-06-08 11:00:00', 'done'),
(12, 13, 12, 'Xét nghiệm tuyến giáp bất thường', 'Bắt đầu dùng thuốc', '2025-06-08 16:00:00', 'done'),
(13, 1, 1, 'Siêu âm tim bình thường', 'Theo dõi', '2025-06-09 09:00:00', 'done');

-- Insert bảng queues
INSERT INTO queues (patient_id, clinic_id, record_id, status, priority, registered_online, qr_code, called_at) VALUES
(8, 1, 1, 'done', 5, FALSE, 'QR001', '2025-06-03 08:30:00'),
(9, 2, 2, 'done', 4, TRUE, 'QR002', '2025-06-03 13:30:00'),
(10, 3, 3, 'done', 3, FALSE, 'QR003', '2025-06-04 09:30:00'),
(11, 5, 4, 'in_progress', 6, TRUE, 'QR004', '2025-06-04 14:30:00'),
(12, 6, 5, 'done', 5, FALSE, 'QR005', '2025-06-05 10:30:00'),
(13, 7, 6, 'done', 4, TRUE, 'QR006', '2025-06-05 15:30:00'),
(14, 8, 7, 'waiting', 2, FALSE, 'QR007', NULL),
(15, 9, 8, 'in_progress', 7, TRUE, 'QR008', '2025-06-06 13:30:00'),
(16, 10, 9, 'waiting', 8, FALSE, 'QR009', NULL),
(17, 11, 10, 'done', 5, TRUE, 'QR010', '2025-06-07 14:30:00'),
(18, 12, 11, 'done', 4, FALSE, 'QR011', '2025-06-08 10:30:00'),
(19, 13, 12, 'done', 3, TRUE, 'QR012', '2025-06-08 15:30:00'),
(20, 1, 13, 'done', 5, FALSE, 'QR013', '2025-06-09 08:30:00');

-- Chèn dữ liệu vào bảng examination_records
INSERT INTO examination_records (patient_id, symptoms, primary_doctor_id, final_diagnosis, created_by_user_id) VALUES
(8, 'Đau ngực', 1, 'Đau thắt ngực ổn định', 5),
(9, 'Đau đầu', 2, 'Đau nửa đầu', 6),
(10, 'Đau khớp', 14, 'Viêm khớp', 5),
(11, 'Phát ban da', 4, 'Chàm', 6),
(12, 'Vấn đề thị lực', 5, 'Cận thị', 5),
(13, 'Đau họng', 6, 'Viêm amidan', 6),
(14, 'Mệt mỏi', 7, 'Thiếu máu', 5),
(15, 'X-quang bất thường', 8, 'Viêm phổi', 6),
(16, 'Sụt cân', 9, 'Nghi ngờ ung thư', 5),
(17, 'Đau bụng', 10, 'Viêm dạ dày', 6),
(18, 'Vấn đề tiết niệu', 11, 'Nhiễm trùng đường tiết niệu', 5),
(19, 'Mệt mỏi', 12, 'Suy giáp', 6),
(20, 'Khó chịu ngực', 1, 'Tiếng thổi tim', 5);

-- Insert bảng presciption
INSERT INTO prescriptions (record_id) VALUES
(14), (15), (16), (17), (18), (19), (20), (21), (22), (23), (24), (25), (26);

-- Chèn dữ liệu vào bảng prescription_items
INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, note) VALUES
(46, 'Aspirin', '100mg', 'Một lần mỗi ngày', '30 ngày', 'Uống sau bữa ăn'),
(47, 'Sumatriptan', '50mg', 'Khi cần thiết', '10 ngày', 'Dành cho đau nửa đầu'),
(48, 'Ibuprofen', '400mg', 'Hai lần mỗi ngày', '14 ngày', 'Uống cùng thức ăn'),
(49, 'Hydrocortisone', 'Kem 1%', 'Thoa hai lần mỗi ngày', '7 ngày', 'Dành cho phát ban'),
(50, 'Nước mắt nhân tạo', '1 giọt', 'Bốn lần mỗi ngày', '30 ngày', 'Dành cho khô mắt'),
(51, 'Amoxicillin', '500mg', 'Ba lần mỗi ngày', '7 ngày', 'Hoàn thành liệu trình'),
(52, 'Ferrous sulfate', '325mg', 'Một lần mỗi ngày', '30 ngày', 'Uống cùng vitamin C'),
(53, 'Kháng sinh', '500mg', 'Hai lần mỗi ngày', '10 ngày', 'Dành cho viêm phổi'),
(54, 'Thuốc hóa trị', 'Theo chỉ định', 'Theo chỉ định', 'Đang thực hiện', 'Dưới sự giám sát của bác sĩ ung bướu'),
(55, 'Omeprazole', '20mg', 'Một lần mỗi ngày', '14 ngày', 'Uống trước bữa ăn'),
(56, 'Ciprofloxacin', '500mg', 'Hai lần mỗi ngày', '7 ngày', 'Dành cho nhiễm trùng tiết niệu'),
(57, 'Levothyroxine', '50mcg', 'Một lần mỗi ngày', 'Đang thực hiện', 'Uống vào buổi sáng'),
(58, 'Thuốc chẹn beta', '25mg', 'Một lần mỗi ngày', '30 ngày', 'Theo dõi huyết áp');


