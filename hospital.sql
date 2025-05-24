CREATE DATABASE hospital;
USE hospital;

-- Bảng người dùng hệ thống
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính của người dùng',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email đăng nhập, duy nhất',
    password_hash VARCHAR(255) COMMENT 'Mã hóa mật khẩu (nếu dùng local)',
    full_name VARCHAR(255) COMMENT 'Tên đầy đủ',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    role ENUM('doctor', 'nurse', 'receptionist', 'admin') NOT NULL COMMENT 'Vai trò người dùng',
    sso_provider ENUM('google', 'facebook', 'local') DEFAULT 'local' COMMENT 'Nguồn xác thực',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động của tài khoản',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật'
);

-- Bệnh nhân
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính bệnh nhân',
    full_name VARCHAR(255) NOT NULL COMMENT 'Tên bệnh nhân',
    date_of_birth DATE COMMENT 'Ngày sinh',
    gender ENUM('male', 'female', 'other') COMMENT 'Giới tính',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    address TEXT COMMENT 'Địa chỉ liên hệ',
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
