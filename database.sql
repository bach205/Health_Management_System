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
    id INT PRIMARY KEY COMMENT 'Khóa chính bệnh nhân (đồng thời là id của users)',
    identity_number VARCHAR(50) COMMENT 'CCCD/BHYT nếu có',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày đăng ký',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Cập nhật gần nhất',
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
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
(8, '123456789001'),  -- Liên kết với patient1@example.com (id=8)
(9, '123456789002'),  -- Liên kết với patient2@example.com (id=9)
(10, '123456789003'), -- Liên kết với patient3@example.com (id=10)
(11, '123456789004'), -- Liên kết với patient4@example.com (id=11)
(12, '123456789005'), -- Liên kết với patient5@example.com (id=12)
(13, '123456789006'); -- Liên kết với patient6@example.com (id=13)

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

-- Insert bảng examination_records
INSERT INTO examination_records (patient_id, symptoms, primary_doctor_id, final_diagnosis, created_by_user_id) VALUES
(8, 'Đau đầu, sốt cao 39 độ, ho nhiều', 1, 'Viêm phổi cấp', 1),
(9, 'Đau bụng dữ dội, buồn nôn', 2, 'Viêm ruột thừa cấp', 2),
(10, 'Đau khớp gối, khó đi lại', 14, 'Thoái hóa khớp gối', 14),
(11, 'Sốt phát ban, đau họng', 3, 'Sốt xuất huyết', 3),
(12, 'Nổi mẩn đỏ toàn thân, ngứa', 4, 'Dị ứng thuốc', 4),
(13, 'Mờ mắt, nhức mắt', 5, 'Cận thị tiến triển', 5);

-- Insert bảng examination_details
INSERT INTO examination_details (record_id, clinic_id, doctor_id, result, note, examined_at, status) VALUES
(1, 1, 1, 'Phổi có dấu hiệu viêm, cần chụp X-quang', 'Bệnh nhân cần nhập viện điều trị', '2025-06-01 09:30:00', 'done'),
(1, 9, 8, 'X-quang phổi cho thấy viêm phổi thùy dưới', 'Cần điều trị kháng sinh', '2025-06-01 10:15:00', 'done'),
(2, 2, 2, 'Đau vùng hố chậu phải, dấu hiệu McBurney dương tính', 'Cần phẫu thuật cấp cứu', '2025-06-02 14:00:00', 'done'),
(3, 3, 14, 'X-quang khớp gối cho thấy thoái hóa độ 2', 'Cần tập vật lý trị liệu', '2025-06-03 08:45:00', 'done'),
(4, 4, 3, 'Xét nghiệm máu dương tính với sốt xuất huyết', 'Theo dõi tiểu cầu', '2025-06-04 11:20:00', 'done'),
(5, 5, 4, 'Test dị ứng dương tính với penicillin', 'Tránh sử dụng nhóm thuốc beta-lactam', '2025-06-05 15:30:00', 'done'),
(6, 6, 5, 'Đo thị lực: 3/10, cần đeo kính -2.5', 'Tái khám sau 3 tháng', '2025-06-06 09:00:00', 'done');

-- Insert bảng queues
INSERT INTO queues (patient_id, clinic_id, record_id, appointment_id, status, priority, registered_online, qr_code, called_at) VALUES
(8, 1, 1, 1, 'done', 1, true, 'QR001', '2025-06-01 09:00:00'),
(9, 2, 2, 2, 'done', 2, false, 'QR002', '2025-06-02 14:00:00'),
(10, 3, 3, 3, 'done', 0, true, 'QR003', '2025-06-03 08:30:00'),
(11, 4, 4, 4, 'done', 1, false, 'QR004', '2025-06-04 11:00:00'),
(12, 5, 5, 5, 'done', 0, true, 'QR005', '2025-06-05 15:00:00'),
(13, 6, 6, 6, 'done', 0, false, 'QR006', '2025-06-06 08:45:00');

-- Insert bảng prescriptions
INSERT INTO prescriptions (record_id) VALUES
(1), (2), (3), (4), (5), (6);

-- Insert bảng prescription_items
INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, note) VALUES
(1, 'Amoxicillin 500mg', '1 viên', '3 lần/ngày', '7 ngày', 'Uống sau ăn'),
(1, 'Paracetamol 500mg', '1 viên', '4 lần/ngày', '5 ngày', 'Khi sốt trên 38.5 độ'),
(2, 'Ceftriaxone 1g', '1 lọ', '2 lần/ngày', '5 ngày', 'Tiêm tĩnh mạch'),
(3, 'Glucosamine 1500mg', '1 viên', '2 lần/ngày', '3 tháng', 'Uống sau ăn'),
(4, 'Paracetamol 500mg', '1 viên', '4 lần/ngày', '5 ngày', 'Khi sốt trên 38.5 độ'),
(5, 'Loratadine 10mg', '1 viên', '1 lần/ngày', '7 ngày', 'Uống buổi tối'),
(6, 'Atropin 1%', '1 giọt', '2 lần/ngày', '7 ngày', 'Nhỏ mắt');

-- Insert bảng payments
INSERT INTO payments (patient_id, record_id, amount, method, payment_time, note, is_refund) VALUES
(8, 1, 1500000.00, 'card', '2025-06-01 11:00:00', 'Thanh toán lần 1', false),
(9, 2, 2500000.00, 'cash', '2025-06-02 15:00:00', 'Thanh toán toàn bộ', false),
(10, 3, 800000.00, 'bank_transfer', '2025-06-03 10:00:00', 'Thanh toán lần 1', false),
(11, 4, 1200000.00, 'e_wallet', '2025-06-04 12:00:00', 'Thanh toán toàn bộ', false),
(12, 5, 500000.00, 'card', '2025-06-05 16:00:00', 'Thanh toán lần 1', false),
(13, 6, 300000.00, 'cash', '2025-06-06 10:00:00', 'Thanh toán toàn bộ', false);

-- Insert bảng payment_balances
INSERT INTO payment_balances (patient_id, balance) VALUES
(8, 0.00),
(9, 0.00),
(10, 0.00),
(11, 0.00),
(12, 0.00),
(13, 0.00);

-- Insert bảng invoice_items
INSERT INTO invoice_items (record_id, description, amount) VALUES
(1, 'Khám bệnh', 300000.00),
(1, 'Chụp X-quang phổi', 500000.00),
(1, 'Thuốc kháng sinh', 700000.00),
(2, 'Khám bệnh', 300000.00),
(2, 'Phẫu thuật ruột thừa', 2000000.00),
(2, 'Thuốc kháng sinh', 200000.00),
(3, 'Khám bệnh', 300000.00),
(3, 'Chụp X-quang khớp', 400000.00),
(3, 'Thuốc điều trị', 100000.00),
(4, 'Khám bệnh', 300000.00),
(4, 'Xét nghiệm máu', 400000.00),
(4, 'Thuốc hạ sốt', 500000.00),
(5, 'Khám bệnh', 300000.00),
(5, 'Test dị ứng', 100000.00),
(5, 'Thuốc chống dị ứng', 100000.00),
(6, 'Khám bệnh', 300000.00),
(6, 'Đo thị lực', 0.00);

-- Bảng lịch hẹn khám
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinic_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    reason TEXT COMMENT 'Lý do khám',
    note TEXT COMMENT 'Ghi chú thêm',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Thêm dữ liệu mẫu cho lịch hẹn khám
INSERT INTO appointments (patient_id, clinic_id, doctor_id, appointment_date, appointment_time, status, reason, note) VALUES
-- Lịch hẹn đang chờ xác nhận
(8, 1, 1, '2025-06-10', '09:00:00', 'pending', 'Đau ngực, khó thở', 'Bệnh nhân có tiền sử bệnh tim'),
(9, 2, 2, '2025-06-11', '14:00:00', 'pending', 'Đau đầu, chóng mặt', 'Bệnh nhân bị stress nhiều'),

-- Lịch hẹn đã xác nhận
(10, 3, 14, '2025-06-12', '08:30:00', 'confirmed', 'Đau khớp gối', 'Cần chụp X-quang'),
(11, 4, 3, '2025-06-13', '10:00:00', 'confirmed', 'Sốt cao, phát ban', 'Cần xét nghiệm máu'),

-- Lịch hẹn đã hủy
(12, 5, 4, '2025-06-14', '15:00:00', 'cancelled', 'Dị ứng da', 'Bệnh nhân hủy do bận việc'),

-- Lịch hẹn đã hoàn thành
(13, 6, 5, '2025-06-15', '09:30:00', 'completed', 'Khám mắt định kỳ', 'Đã đeo kính cận');

-- Thêm bảng available_slots để quản lý các khung giờ khám có sẵn
CREATE TABLE available_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    clinic_id INT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id)
);

-- Thêm dữ liệu mẫu cho các khung giờ khám
INSERT INTO available_slots (doctor_id, clinic_id, slot_date, start_time, end_time) VALUES
-- Khung giờ của bác sĩ tim mạch
(1, 1, '2025-06-10', '08:00:00', '08:30:00'),
(1, 1, '2025-06-10', '08:30:00', '09:00:00'),
(1, 1, '2025-06-10', '09:00:00', '09:30:00'),
(1, 1, '2025-06-10', '09:30:00', '10:00:00'),

-- Khung giờ của bác sĩ thần kinh
(2, 2, '2025-06-11', '13:00:00', '13:30:00'),
(2, 2, '2025-06-11', '13:30:00', '14:00:00'),
(2, 2, '2025-06-11', '14:00:00', '14:30:00'),
(2, 2, '2025-06-11', '14:30:00', '15:00:00'),

-- Khung giờ của bác sĩ chỉnh hình
(14, 3, '2025-06-12', '08:00:00', '08:30:00'),
(14, 3, '2025-06-12', '08:30:00', '09:00:00'),
(14, 3, '2025-06-12', '09:00:00', '09:30:00'),
(14, 3, '2025-06-12', '09:30:00', '10:00:00');

-- Thêm cột appointment_id vào bảng queues
ALTER TABLE queues 
ADD COLUMN appointment_id INT COMMENT 'Liên kết với lịch hẹn (nếu có)' AFTER record_id;

-- Thêm foreign key constraint
ALTER TABLE queues
ADD CONSTRAINT fk_queues_appointments
FOREIGN KEY (appointment_id) REFERENCES appointments(id);

-- Cập nhật dữ liệu hiện có (nếu cần)
UPDATE queues q
JOIN appointments a ON q.patient_id = a.patient_id 
    AND q.clinic_id = a.clinic_id
    AND DATE(q.created_at) = a.appointment_date
SET q.appointment_id = a.id
WHERE q.appointment_id IS NULL;