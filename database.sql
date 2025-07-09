-- Create and use the hospital database

USE hospital;

-- Disable safe update mode to allow updates without WHERE clause on key columns
SET SQL_SAFE_UPDATES = 0;

-- drop database hospital

-- Table for system users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key for users',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Unique login email',
    password VARCHAR(255) COMMENT 'Hashed password (for local authentication)',
    full_name VARCHAR(255) COMMENT 'Full name',
    date_of_birth DATE COMMENT 'Date of birth',
    gender ENUM('male', 'female', 'other') COMMENT 'Gender',
    phone VARCHAR(20) COMMENT 'Phone number',
    address TEXT COMMENT 'Contact address',
    role ENUM('doctor', 'nurse', 'receptionist', 'admin', 'patient') NOT NULL COMMENT 'User role',
    sso_provider ENUM('google', 'facebook', 'local') DEFAULT 'local' COMMENT 'Authentication provider',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Account status',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update timestamp',
    avatar LONGTEXT NULL
);

-- Table for patients
CREATE TABLE patients (
    id INT PRIMARY KEY COMMENT 'Primary key for patients (references users.id)',
    identity_number VARCHAR(50) COMMENT 'ID card or insurance number',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration date',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for clinics
CREATE TABLE clinics (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Clinic ID',
    name VARCHAR(255) NOT NULL COMMENT 'Specialty name',
    description TEXT COMMENT 'Clinic description'
);
select *from users;
-- Table for doctors
-- Thông tin mở rộng từ user (bác sĩ)
CREATE TABLE doctors (
    user_id INT PRIMARY KEY COMMENT 'Tham chiếu đến users(id)',
    specialty VARCHAR(255) COMMENT 'Chuyên môn', -- này tạm thời t để đây
    bio TEXT COMMENT 'Giới thiệu',
	rating DECIMAL(2,1) DEFAULT 0.0 COMMENT '(tối đa 9.9) Đánh giá trung bình, sửa rating trên backend', 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



-- Table for shifts
CREATE TABLE shifts (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Shift ID',
    name VARCHAR(100) COMMENT 'Shift name (e.g., morning, afternoon)',
    start_time TIME COMMENT 'Start time',
    end_time TIME COMMENT 'End time'
);

-- Table for work schedules
CREATE TABLE work_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Work schedule ID',
    user_id INT NOT NULL COMMENT 'Staff member (doctor/nurse)',
    clinic_id INT NOT NULL COMMENT 'Clinic',
    work_date DATE NOT NULL COMMENT 'Work date',
    shift_id INT NOT NULL COMMENT 'Specific shift',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
);

-- Table for examination orders
CREATE TABLE examination_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL COMMENT 'Referring doctor',
    patient_id INT NOT NULL COMMENT 'Patient',
    from_clinic_id INT NOT NULL COMMENT 'Current clinic',
    to_clinic_id INT NOT NULL COMMENT 'Referred clinic',
    total_cost DECIMAL(10,2) DEFAULT 0 COMMENT 'Estimated total cost',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (from_clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (to_clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Table for examination records
CREATE TABLE examination_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL COMMENT 'Patient',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update time',
    symptoms TEXT COMMENT 'Initial symptoms',
    primary_doctor_id INT COMMENT 'Primary doctor',
    final_diagnosis TEXT COMMENT 'Final diagnosis',
    created_by_user_id INT COMMENT 'User who created the record',
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (primary_doctor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table for examination details
CREATE TABLE examination_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL COMMENT 'General examination record',
    clinic_id INT NOT NULL COMMENT 'Specific clinic',
    doctor_id INT NOT NULL COMMENT 'Doctor at clinic',
    result TEXT COMMENT 'Examination result',
    note TEXT COMMENT 'Additional notes',
    examined_at DATETIME COMMENT 'Examination completion time',
    status ENUM('pending', 'in_progress', 'done', 'cancelled') DEFAULT 'pending' COMMENT 'Examination status',
    FOREIGN KEY (record_id) REFERENCES examination_records(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for patient queues
CREATE TABLE queues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinic_id INT NOT NULL,
    record_id INT COMMENT 'Related examination record',
    appointment_id INT COMMENT 'Related appointment',
    status ENUM('waiting', 'in_progress', 'done', 'skipped') DEFAULT 'waiting' COMMENT 'Queue status',
    priority TINYINT DEFAULT 0 COMMENT 'Priority (0 low - 10 high)',
    registered_online BOOLEAN DEFAULT FALSE COMMENT 'Online registration',
    qr_code VARCHAR(255) COMMENT 'Check-in QR code',
    called_at DATETIME COMMENT 'Time called',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES examination_records(id) ON DELETE SET NULL
    -- FOREIGN KEY for appointment_id will be added after appointments table
);

-- Table for prescriptions
CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL COMMENT 'Linked examination record',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES examination_records(id) ON DELETE CASCADE
);

-- Table for prescription items
CREATE TABLE prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL COMMENT 'Related prescription',
    medicine_name VARCHAR(255) NOT NULL COMMENT 'Medicine name',
    dosage VARCHAR(100) COMMENT 'Dosage',
    frequency VARCHAR(100) COMMENT 'Frequency per day',
    duration VARCHAR(100) COMMENT 'Duration of use',
    note TEXT COMMENT 'Doctor`s notes',
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- Table for payments
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL COMMENT 'Payer',
    record_id INT COMMENT 'Linked examination record',
    amount DECIMAL(10,2) NOT NULL COMMENT 'Payment amount',
    method ENUM('cash', 'card', 'bank_transfer', 'e_wallet') COMMENT 'Payment method',
    payment_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Payment timestamp',
    note TEXT COMMENT 'Notes (e.g., installment, refund)',
    is_refund BOOLEAN DEFAULT FALSE COMMENT 'Is a refund',
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (record_id) REFERENCES examination_records(id) ON DELETE SET NULL
);

-- Table for payment balances
CREATE TABLE payment_balances (
    patient_id INT PRIMARY KEY COMMENT 'Primary key is patient ID',
    balance DECIMAL(10,2) DEFAULT 0 COMMENT 'Balance (negative if owed)',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Table for invoice items
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL COMMENT 'Linked examination record',
    description TEXT COMMENT 'Fee description (consultation, test, medicine)',
    amount DECIMAL(10,2) NOT NULL COMMENT 'Item cost',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES examination_records(id) ON DELETE CASCADE
);

-- Table for appointments
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinic_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    reason TEXT COMMENT 'Reason for visit',
    note TEXT COMMENT 'Additional notes',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for available slots
CREATE TABLE available_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    clinic_id INT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
);

-- Table for doctor ratings and comments
CREATE TABLE doctor_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Rating ID',
    doctor_id INT NOT NULL COMMENT 'Doctor being rated',
    patient_id INT NOT NULL COMMENT 'Patient giving the rating',
    appointment_id INT COMMENT 'Related appointment (optional)',
    rating DECIMAL(2,1) NOT NULL COMMENT 'Rating from 1.0 to 5.0',
    comment TEXT COMMENT 'Patient comment/review',
    is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Whether the rating is anonymous',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Rating creation time',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Rating update time',
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CHECK (rating >= 1.0 AND rating <= 5.0)
);

-- Add appointment_id column to queues and foreign key constraint
ALTER TABLE queues
ADD CONSTRAINT fk_queues_appointments
FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- Add priority column to appointments (fixing the original error)

ALTER TABLE appointments
ADD COLUMN priority INT DEFAULT 0 COMMENT '0: normal booking, 1: nurse booking, 2: urgent' AFTER status;

-- Update queues with appointment_id where possible
UPDATE queues q
JOIN appointments a ON q.patient_id = a.patient_id 
    AND q.clinic_id = a.clinic_id
    AND DATE(q.created_at) = a.appointment_date
SET q.appointment_id = a.id
WHERE q.appointment_id IS NULL;

-- Insert sample data into users
INSERT INTO users (email, password, full_name, phone, role, date_of_birth, gender, address, sso_provider, is_active) VALUES
('admin@example.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Admin', '0123456789', 'admin', '1990-01-01', 'other', 'Hanoi', 'local', TRUE),
('drnguyenvanminh@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Văn Minh', '0987654321', 'doctor', '1985-03-15', 'male', 'Hà Nội', 'local', TRUE),
('drtranthilan@gmail.com', '$2b$10$lDLp1RH5ZZ.tJ3MwjJZjMuEvK8oJfdIk4o9MMxLxlPmikyj.P3muK', 'Trần Thị Lan', '0987654322', 'doctor', '1988-07-22', 'female', 'TP.HCM', 'local', TRUE),
('nurselevanhai@gmail.com', '$2b$10$DWhHRcJ6oWS.X/Yh9DEkAOsB2Vg9uAQmbaC667MhBZnGxeahklRXe', 'Lê Văn Hải', '0987654323', 'nurse', '1990-11-10', 'male', 'Đà Nẵng', 'local', TRUE),
('nursephamthihong@gmail.com', '$2b$10$SJupulIuCV59ERzfYZqAxeVmXJ6cqOgAhwza.zjiRcZUd0XmMZsCW', 'Phạm Thị Hồng', '0987654324', 'nurse', '1992-04-05', 'female', 'Hà Nội', 'local', TRUE),
('receptionhoangvanduc@gmail.com', '$2b$10$YtadcrWr4QG9tW8xHqgxweSA1FKEmkJd.p8doH6wVllr4NiUWHt..', 'Hoàng Văn Đức', '0987654325', 'receptionist', '1995-09-12', 'male', 'TP.HCM', 'local', TRUE),
('receptionvuthianh@gmail.com', '$2b$10$C8XYHl53FkSxrLfh4Dqace.Kh5S7ZuFegCg3O9xl5cbjZoPw741ge', 'Vũ Thị Ánh ', '0987654326', 'receptionist', '1993-12-20', 'female', 'Đà Nẵng', 'local', TRUE),
('tranvanhung@gmail.com', '$2b$10$GxnPuU4OqeCml44HiYk/heRKFk8h0AbY/qM6rmc0A7mrQ4883Elmq', 'Trần Văn Hùng', '0987654328', 'patient', '1998-02-14', 'male', 'TP.HCM', 'local', TRUE),
('lethithu@gmail.com', '$2b$10$UbIucGc/ZC6mIkCGP7CCjuESGDoq1PMGSyDzD0K3UQ3XGd.whndxK', 'Lê Thị Thu', '0987654329', 'patient', '1996-08-25', 'female', 'Hà Nội', 'local', TRUE),
('phamvantuan@gmail.com', '$2b$10$W3olOAm.7geI1AY9648vDOUcp/rosMdoWYV1uXeIVd8p9DLwePCzm', 'Phạm Văn Tuấn', '0987654330', 'patient', '1990-05-17', 'male', 'Đà Nẵng', 'facebook', TRUE),
('hoangthimai@gmail.com', '$2b$10$YJ49PgM.igiHDjkBqZO/zOR.K.V9cOd.it3hoMqw10rDsgSPz9zVO', 'Hoàng Thị Mai', '0987654331', 'patient', '1987-03-09', 'female', 'TP.HCM', 'local', TRUE),
('vuvanlong@gmail.com', '$2b$10$3OuIqvhF/R0OgNScZhcCEO9P02jHNhFat2ClD.4VB77dxl5QT9yOG', 'Vũ Văn Long', '0987654332', 'patient', '1994-10-01', 'male', 'Hà Nội', 'google', TRUE),
('nguyenthilinh@gmail.com', '$2b$10$DrvOTxC7TE8HM2oIBtF52u36y.8FpDMnb.FFOpy72srPpAGRWw5EO', 'Nguyễn Thị Linh', '0987654333', 'patient', '1999-07-07', 'female', 'Đà Nẵng', 'local', TRUE),
('drtrannam@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Trần Văn Nam', '0987654334', 'doctor', '1983-01-25', 'male', 'TP.HCM', 'local', TRUE),
('nurselethuyen@gmail.com', '$2b$10$vkB5NNh89QrcCfKthf2Xy.B7FViJFW4guWQGJ.91K2aC8yc965a0y', 'Lê Thị Thuyền', '0987654335', 'nurse', '1991-06-15', 'female', 'Hà Nội', 'local', TRUE);

-- Insert sample data into patients
INSERT INTO patients (id, identity_number) VALUES
(8, '123456789001'),
(9, '123456789002'),
(10, '123456789003'),
(11, '123456789004'),
(12, '123456789005'),
(13, '123456789006');

-- Insert sample data into clinics
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

-- Insert sample data into doctors
INSERT INTO doctors (user_id, specialty, bio) VALUES
(2, 'Tim mạch', 'Bác sĩ tim mạch với 10 năm kinh nghiệm'),
(3, 'Thần kinh', 'Chuyên gia về rối loạn thần kinh'),
(14, 'Chấn thương chỉnh hình', 'Chuyên gia phẫu thuật thay khớp');

-- Insert sample data into shifts
INSERT INTO shifts (name, start_time, end_time) VALUES
('08:00-08:30', '08:00:00', '08:30:00'),
('08:30-09:00', '08:30:00', '09:00:00'),
('09:00-09:30', '09:00:00', '09:30:00'),
('09:30-10:00', '09:30:00', '10:00:00'),
('10:00-10:30', '10:00:00', '10:30:00'),
('10:30-11:00', '10:30:00', '11:00:00'),
('11:00-11:30', '11:00:00', '11:30:00'),
('11:30-12:00', '11:30:00', '12:00:00'),
('13:00-13:30', '13:00:00', '13:30:00'),
('13:30-14:00', '13:30:00', '14:00:00'),
('14:00-14:30', '14:00:00', '14:30:00'),
('14:30-15:00', '14:30:00', '15:00:00'),
('15:00-15:30', '15:00:00', '15:30:00'),
('15:30-16:00', '15:30:00', '16:00:00'),
('16:00-16:30', '16:00:00', '16:30:00'),
('16:30-17:00', '16:30:00', '17:00:00'),
('18:00-18:30', '18:00:00', '18:30:00'),
('18:30-19:00', '18:30:00', '19:00:00'),
('19:00-19:30', '19:00:00', '19:30:00'),
('19:30-20:00', '19:30:00', '20:00:00'),
('20:00-20:30', '20:00:00', '20:30:00'),
('20:30-21:00', '20:30:00', '21:00:00'),
('21:00-21:30', '21:00:00', '21:30:00'),
('21:30-22:00', '21:30:00', '22:00:00');

-- Insert sample data into work_schedules
INSERT INTO work_schedules (user_id, clinic_id, work_date, shift_id) VALUES
(2, 2, '2025-06-16', 2),
(2, 2, '2025-06-17', 1),
(2, 2, '2025-06-18', 2),
(2, 2, '2025-06-19', 2),
(2, 2, '2025-06-20', 1),
(2, 2, '2025-06-21', 2),
(2, 2, '2025-06-23', 2),
(2, 2, '2025-06-24', 1),
(2, 2, '2025-06-25', 2),
(2, 2, '2025-06-26', 1),
(2, 2, '2025-06-27', 2),
(2, 2, '2025-06-28', 1),
(14, 3, '2025-06-16', 1),
(14, 3, '2025-06-17', 2),
(14, 3, '2025-06-18', 1),
(14, 3, '2025-06-19', 1),
(14, 3, '2025-06-20', 2),
(14, 3, '2025-06-21', 1),
(14, 3, '2025-06-23', 1),
(14, 3, '2025-06-24', 1),
(14, 3, '2025-06-25', 2),
(14, 3, '2025-06-26', 1),
(14, 3, '2025-06-27', 1),
(14, 3, '2025-06-28', 2),
(3, 1, '2025-06-16', 1),
(3, 2, '2025-06-16', 2),
(3, 3, '2025-06-17', 1),
(3, 4, '2025-06-17', 2),
(3, 1, '2025-06-18', 1),
(3, 2, '2025-06-19', 2),
(3, 3, '2025-06-20', 1),
(4, 5, '2025-06-16', 1),
(4, 6, '2025-06-16', 2),
(4, 7, '2025-06-17', 1),
(4, 8, '2025-06-17', 2),
(4, 9, '2025-06-18', 1),
(4, 10, '2025-06-19', 2),
(4, 11, '2025-06-20', 1),
(15, 1, '2025-06-16', 3),
(15, 2, '2025-06-17', 3),
(15, 8, '2025-06-21', 5),
(15, 8, '2025-06-22', 5),
(5, 1, '2025-06-16', 5),
(5, 2, '2025-06-17', 5),
(5, 3, '2025-06-18', 5),
(5, 8, '2025-06-19', 5),
(5, 1, '2025-06-20', 5),
(6, 4, '2025-06-16', 2),
(6, 5, '2025-06-17', 2),
(6, 6, '2025-06-18', 2),
(6, 7, '2025-06-19', 2),
(6, 8, '2025-06-21', 2),
(6, 8, '2025-06-22', 2);

-- Insert sample data into examination_records
INSERT INTO examination_records (patient_id, symptoms, primary_doctor_id, final_diagnosis, created_by_user_id) VALUES
(8, 'Đau đầu, sốt cao 39 độ, ho nhiều', 2, 'Viêm phổi cấp', 2),
(9, 'Đau bụng dữ dội, buồn nôn', 3, 'Viêm ruột thừa cấp', 3),
(10, 'Đau khớp gối, khó đi lại', 14, 'Thoái hóa khớp gối', 14),
(11, 'Sốt phát ban, đau họng', 2, 'Sốt xuất huyết', 2),
(12, 'Nổi mẩn đỏ toàn thân, ngứa', 3, 'Dị ứng thuốc', 3),
(13, 'Mờ mắt, nhức mắt', 14, 'Cận thị tiến triển', 14);

-- Insert sample data into examination_details
INSERT INTO examination_details (record_id, clinic_id, doctor_id, result, note, examined_at, status) VALUES
(1, 1, 2, 'Phổi có dấu hiệu viêm, cần chụp X-quang', 'Bệnh nhân cần nhập viện điều trị', '2025-06-01 09:30:00', 'done'),
(1, 9, 2, 'X-quang phổi cho thấy viêm phổi thùy dưới', 'Cần điều trị kháng sinh', '2025-06-01 10:15:00', 'done'),
(2, 2, 3, 'Đau vùng hố chậu phải, dấu hiệu McBurney dương tính', 'Cần phẫu thuật cấp cứu', '2025-06-02 14:00:00', 'done'),
(3, 3, 14, 'X-quang khớp gối cho thấy thoái hóa độ 2', 'Cần tập vật lý trị liệu', '2025-06-03 08:45:00', 'done'),
(4, 4, 2, 'Xét nghiệm máu dương tính với sốt xuất huyết', 'Theo dõi tiểu cầu', '2025-06-04 11:20:00', 'done'),
(5, 5, 3, 'Test dị ứng dương tính với penicillin', 'Tránh sử dụng nhóm thuốc beta-lactam', '2025-06-05 15:30:00', 'done'),
(6, 6, 14, 'Đo thị lực: 3/10, cần đeo kính -2.5', 'Tái khám sau 3 tháng', '2025-06-06 09:00:00', 'done');

-- Insert sample data into prescriptions
INSERT INTO prescriptions (record_id) VALUES
(1), (2), (3), (4), (5), (6);

-- Insert sample data into prescription_items
INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, note) VALUES
(1, 'Amoxicillin 500mg', '1 viên', '3 lần/ngày', '7 ngày', 'Uống sau ăn'),
(1, 'Paracetamol 500mg', '1 viên', '4 lần/ngày', '5 ngày', 'Khi sốt trên 38.5 độ'),
(2, 'Ceftriaxone 1g', '1 lọ', '2 lần/ngày', '5 ngày', 'Tiêm tĩnh mạch'),
(3, 'Glucosamine 1500mg', '1 viên', '2 lần/ngày', '3 tháng', 'Uống sau ăn'),
(4, 'Paracetamol 500mg', '1 viên', '4 lần/ngày', '5 ngày', 'Khi sốt trên 38.5 độ'),
(5, 'Loratadine 10mg', '1 viên', '1 lần/ngày', '7 ngày', 'Uống buổi tối'),
(6, 'Atropin 1%', '1 giọt', '2 lần/ngày', '7 ngày', 'Nhỏ mắt');

-- Insert sample data into payments
INSERT INTO payments (patient_id, record_id, amount, method, payment_time, note, is_refund) VALUES
(8, 1, 1500000.00, 'card', '2025-06-01 11:00:00', 'Thanh toán lần 1', FALSE),
(9, 2, 2500000.00, 'cash', '2025-06-02 15:00:00', 'Thanh toán toàn bộ', FALSE),
(10, 3, 800000.00, 'bank_transfer', '2025-06-03 10:00:00', 'Thanh toán lần 1', FALSE),
(11, 4, 1200000.00, 'e_wallet', '2025-06-04 12:00:00', 'Thanh toán toàn bộ', FALSE),
(12, 5, 500000.00, 'card', '2025-06-05 16:00:00', 'Thanh toán lần 1', FALSE),
(13, 6, 300000.00, 'cash', '2025-06-06 10:00:00', 'Thanh toán toàn bộ', FALSE);

-- Insert sample data into payment_balances
INSERT INTO payment_balances (patient_id, balance) VALUES
(8, 0.00),
(9, 0.00),
(10, 0.00),
(11, 0.00),
(12, 0.00),
(13, 0.00);

-- Insert sample data into invoice_items
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

-- Insert sample data into appointments
INSERT INTO appointments (patient_id, clinic_id, doctor_id, appointment_date, appointment_time, status, priority, reason, note) VALUES
(8, 1, 2, '2025-06-10', '09:00:00', 'pending', 0, 'Đau ngực, khó thở', 'Bệnh nhân có tiền sử bệnh tim'),
(9, 2, 3, '2025-06-11', '14:00:00', 'pending', 0, 'Đau đầu, chóng mặt', 'Bệnh nhân bị stress nhiều'),
(10, 3, 14, '2025-06-12', '08:30:00', 'confirmed', 0, 'Đau khớp gối', 'Cần chụp X-quang'),
(11, 4, 2, '2025-06-13', '10:00:00', 'confirmed', 0, 'Sốt cao, phát ban', 'Cần xét nghiệm máu'),
(12, 5, 3, '2025-06-14', '15:00:00', 'cancelled', 0, 'Dị ứng da', 'Bệnh nhân hủy do bận việc'),
(13, 6, 14, '2025-06-15', '09:30:00', 'completed', 0, 'Khám mắt định kỳ', 'Đã đeo kính cận'),
(8, 1, 2, '2025-06-20', '08:30:00', 'confirmed', 0, 'Tái khám sau điều trị viêm phổi', 'Kiểm tra phục hồi sau 3 tuần điều trị'),
(9, 8, 2, '2025-06-18', '10:00:00', 'pending', 0, 'Khám tổng quát định kỳ', 'Bệnh nhân có tiền sử phẫu thuật ruột thừa'),
(10, 3, 14, '2025-06-25', '14:30:00', 'confirmed', 0, 'Tái khám khớp gối', 'Đánh giá hiệu quả vật lý trị liệu'),
(11, 7, 3, '2025-06-16', '09:00:00', 'pending', 0, 'Đau tai, nghe kém', 'Triệu chứng xuất hiện sau cảm lạnh'),
(12, 11, 2, '2025-06-17', '15:30:00', 'confirmed', 0, 'Đau bụng, khó tiêu', 'Bệnh nhân có tiền sử dị ứng thuốc'),
(13, 12, 14, '2025-06-19', '11:00:00', 'pending', 0, 'Khám tuyến tiền liệt', 'Nam giới trên 50 tuổi, khám định kỳ'),
(8, 9, 2, '2025-06-22', '08:00:00', 'confirmed', 0, 'Chụp CT ngực kiểm tra', 'Theo dõi sau điều trị viêm phổi'),
(9, 10, 3, '2025-06-23', '13:30:00', 'pending', 0, 'Tư vấn dinh dưỡng ung thư', 'Phòng ngừa ung thư đại tràng'),
(10, 13, 14, '2025-06-24', '10:30:00', 'confirmed', 0, 'Khám tiểu đường', 'Kiểm tra đường huyết định kỳ'),
(11, 1, 2, '2025-06-21', '09:30:00', 'confirmed', 0, 'Khám tim định kỳ', 'Bệnh nhân có gia đình bị bệnh tim'),
(12, 2, 3, '2025-06-21', '14:00:00', 'pending', 0, 'Đau đầu mãn tính', 'Stress công việc, cần tư vấn'),
(13, 4, 14, '2025-06-22', '10:00:00', 'confirmed', 0, 'Khám sức khỏe trẻ em', 'Tiêm chủng định kỳ'),
(8, 5, 2, '2025-06-15', '16:00:00', 'cancelled', 0, 'Khám da dị ứng', 'Bệnh nhân đã khỏi, không cần khám'),
(9, 6, 3, '2025-06-16', '11:30:00', 'cancelled', 0, 'Khám mắt', 'Xung đột lịch trình, sẽ đặt lại'),
(10, 7, 14, '2025-06-17', '15:00:00', 'cancelled', 0, 'Khám tai mũi họng', 'Triệu chứng đã thuyên giảm'),
(11, 8, 2, '2025-06-02', '08:30:00', 'completed', 0, 'Khám tổng quát', 'Đã hoàn thành, kết quả bình thường'),
(12, 9, 3, '2025-06-03', '14:30:00', 'completed', 0, 'Chụp X-quang lưng', 'Phát hiện thoái hóa cột sống nhẹ'),
(13, 10, 14, '2025-06-04', '16:00:00', 'completed', 0, 'Tư vấn phòng chống ung thư', 'Đã tư vấn lối sống lành mạnh'),
(8, 8, 2, '2025-06-09', '07:30:00', 'completed', 2, 'Cấp cứu đau bụng', 'Đã xử lý, không nghiêm trọng'),
(9, 1, 3, '2025-06-08', '20:00:00', 'completed', 2, 'Đau ngực cấp', 'Tim bình thường, do căng thẳng');

-- Insert sample data into available_slots
INSERT INTO available_slots (doctor_id, clinic_id, slot_date, start_time, end_time, is_available) VALUES
(2, 1, '2025-06-10', '08:00:00', '08:30:00', TRUE),
(2, 1, '2025-06-10', '08:30:00', '09:00:00', TRUE),
(2, 1, '2025-06-10', '09:00:00', '09:30:00', FALSE),
(2, 1, '2025-06-10', '09:30:00', '10:00:00', TRUE),
(3, 2, '2025-06-11', '13:00:00', '13:30:00', TRUE),
(3, 2, '2025-06-11', '13:30:00', '14:00:00', TRUE),
(3, 2, '2025-06-11', '14:00:00', '14:30:00', FALSE),
(3, 2, '2025-06-11', '14:30:00', '15:00:00', TRUE),
(14, 3, '2025-06-12', '08:00:00', '08:30:00', TRUE),
(14, 3, '2025-06-12', '08:30:00', '09:00:00', FALSE),
(14, 3, '2025-06-12', '09:00:00', '09:30:00', TRUE),
(14, 3, '2025-06-12', '09:30:00', '10:00:00', TRUE),
(2, 1, '2025-06-20', '08:00:00', '08:30:00', TRUE),
(2, 1, '2025-06-20', '08:30:00', '09:00:00', FALSE),
(2, 1, '2025-06-20', '09:00:00', '09:30:00', TRUE),
(2, 1, '2025-06-20', '09:30:00', '10:00:00', TRUE),
(2, 8, '2025-06-18', '09:30:00', '10:00:00', TRUE),
(2, 8, '2025-06-18', '10:00:00', '10:30:00', FALSE),
(2, 8, '2025-06-18', '10:30:00', '11:00:00', TRUE),
(14, 3, '2025-06-25', '14:00:00', '14:30:00', TRUE),
(14, 3, '2025-06-25', '14:30:00', '15:00:00', FALSE),
(14, 3, '2025-06-25', '15:00:00', '15:30:00', TRUE),
(3, 7, '2025-06-16', '08:30:00', '09:00:00', TRUE),
(3, 7, '2025-06-16', '09:00:00', '09:30:00', FALSE),
(3, 7, '2025-06-16', '09:30:00', '10:00:00', TRUE),
(2, 11, '2025-06-17', '15:00:00', '15:30:00', TRUE),
(2, 11, '2025-06-17', '15:30:00', '16:00:00', FALSE),
(2, 11, '2025-06-17', '16:00:00', '16:30:00', TRUE),
(14, 12, '2025-06-19', '10:30:00', '11:00:00', TRUE),
(14, 12, '2025-06-19', '11:00:00', '11:30:00', FALSE),
(14, 12, '2025-06-19', '11:30:00', '12:00:00', TRUE);

-- Update available_slots to reflect booked appointments
UPDATE available_slots 
SET is_available = FALSE 
WHERE (doctor_id = 2 AND clinic_id = 1 AND slot_date = '2025-06-20' AND start_time = '08:30:00')
   OR (doctor_id = 2 AND clinic_id = 8 AND slot_date = '2025-06-18' AND start_time = '10:00:00')
   OR (doctor_id = 14 AND clinic_id = 3 AND slot_date = '2025-06-25' AND start_time = '14:30:00')
   OR (doctor_id = 3 AND clinic_id = 7 AND slot_date = '2025-06-16' AND start_time = '09:00:00')
   OR (doctor_id = 2 AND clinic_id = 11 AND slot_date = '2025-06-17' AND start_time = '15:30:00')
   OR (doctor_id = 14 AND clinic_id = 12 AND slot_date = '2025-06-19' AND start_time = '11:00:00');

-- Thêm 10 tài khoản bác sĩ mới (tên thật, email chuyên nghiệp)
INSERT INTO users (email, password, full_name, phone, role, date_of_birth, gender, address, sso_provider, is_active) VALUES
('nguyenhoanglong@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Hoàng Long', '0901000001', 'doctor', '1980-01-01', 'male', 'Hà Nội', 'local', TRUE),
('tranthithao@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Trần Thị Thảo', '0901000002', 'doctor', '1981-02-02', 'female', 'TP.HCM', 'local', TRUE),
('levanphuc@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Lê Văn Phúc', '0901000003', 'doctor', '1982-03-03', 'male', 'Đà Nẵng', 'local', TRUE),
('phamthiminh@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Phạm Thị Minh', '0901000004', 'doctor', '1983-04-04', 'female', 'Cần Thơ', 'local', TRUE),
('dohoangnam@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Đỗ Hoàng Nam', '0901000005', 'doctor', '1984-05-05', 'male', 'Hải Phòng', 'local', TRUE),
('buithithu@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Bùi Thị Thu', '0901000006', 'doctor', '1985-06-06', 'female', 'Huế', 'local', TRUE),
('hoangvanquan@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Hoàng Văn Quân', '0901000007', 'doctor', '1986-07-07', 'male', 'Vũng Tàu', 'local', TRUE),
('nguyenthithanh@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Thị Thanh', '0901000008', 'doctor', '1987-08-08', 'female', 'Quảng Ninh', 'local', TRUE),
('phamvantruong@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Phạm Văn Trường', '0901000009', 'doctor', '1988-09-09', 'male', 'Bình Dương', 'local', TRUE),
('vuthithao@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Vũ Thị Thảo', '0901000010', 'doctor', '1989-10-10', 'female', 'Nam Định', 'local', TRUE);

-- Thêm 10 tài khoản y tá mới (tên thật, email chuyên nghiệp)
INSERT INTO users (email, password, full_name, phone, role, date_of_birth, gender, address, sso_provider, is_active) VALUES
('nguyenthithu@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Thị Thu', '0911000001', 'nurse', '1990-01-01', 'female', 'Hà Nội', 'local', TRUE),
('levanminh@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Lê Văn Minh', '0911000002', 'nurse', '1991-02-02', 'male', 'TP.HCM', 'local', TRUE),
('phamthithao@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Phạm Thị Thảo', '0911000003', 'nurse', '1992-03-03', 'female', 'Đà Nẵng', 'local', TRUE),
('tranvanphuoc@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Trần Văn Phước', '0911000004', 'nurse', '1993-04-04', 'male', 'Cần Thơ', 'local', TRUE),
('dothithanh@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Đỗ Thị Thanh', '0911000005', 'nurse', '1994-05-05', 'female', 'Hải Phòng', 'local', TRUE),
('buivantrung@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Bùi Văn Trung', '0911000006', 'nurse', '1995-06-06', 'male', 'Huế', 'local', TRUE),
('hoangthithu@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Hoàng Thị Thu', '0911000007', 'nurse', '1996-07-07', 'female', 'Vũng Tàu', 'local', TRUE),
('nguyenvanphat@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Nguyễn Văn Phát', '0911000008', 'nurse', '1997-08-08', 'male', 'Quảng Ninh', 'local', TRUE),
('phamthithu2@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Phạm Thị Thu', '0911000009', 'nurse', '1998-09-09', 'female', 'Bình Dương', 'local', TRUE),
('vuvantrung@gmail.com', '$2b$10$EM75hze8S5jL76D88ozXOekeWhZIFxiS8s8UqOT3l6PHaqqwU5hh2', 'Vũ Văn Trung', '0911000010', 'nurse', '1999-10-10', 'male', 'Nam Định', 'local', TRUE);

-- Thêm thông tin chi tiết cho các bác sĩ mới
INSERT INTO doctors (user_id, specialty, bio) VALUES
(16, 'Nội tổng quát', 'Bác sĩ có kinh nghiệm làm việc tại khoa nội tổng quát.'),
(17, 'Nhi khoa', 'Chuyên gia về chăm sóc sức khỏe trẻ em và trẻ sơ sinh.'),
(18, 'Tiêu hóa', 'Bác sĩ chuyên khoa tiêu hóa với nhiều năm kinh nghiệm.'),
(19, 'Da liễu', 'Chuyên gia về các bệnh lý da và thẩm mỹ da.'),
(20, 'Tai mũi họng', 'Bác sĩ chuyên khoa tai mũi họng, phẫu thuật nội soi.'),
(21, 'Mắt', 'Chuyên gia về các bệnh lý mắt và phẫu thuật khúc xạ.'),
(22, 'Ung bướu', 'Bác sĩ chuyên điều trị các bệnh lý ung bướu.'),
(23, 'Tiết niệu', 'Chuyên gia về các bệnh lý hệ tiết niệu và nam khoa.'),
(24, 'Nội tiết', 'Bác sĩ chuyên điều trị các rối loạn hormone và tiểu đường.'),
(25, 'Chẩn đoán hình ảnh', 'Chuyên gia về đọc và phân tích hình ảnh y khoa.');

-- Thêm 15 appointments mới
INSERT INTO appointments (patient_id, clinic_id, doctor_id, appointment_date, appointment_time, status, priority, reason, note) VALUES
-- Patient 8 - Các khoa khác nhau
(8, 2, 3, '2025-06-26', '09:00:00', 'confirmed', 0, 'Đau đầu, chóng mặt', 'Triệu chứng xuất hiện sau khi làm việc nhiều'),
(8, 5, 19, '2025-06-27', '14:30:00', 'pending', 0, 'Nổi mẩn đỏ trên da', 'Có thể do dị ứng thời tiết'),
(8, 7, 20, '2025-06-28', '10:00:00', 'confirmed', 0, 'Đau họng, khó nuốt', 'Triệu chứng kéo dài 3 ngày'),

-- Patient 9 - Các khoa khác nhau
(9, 3, 14, '2025-06-26', '15:00:00', 'confirmed', 0, 'Đau lưng, khó vận động', 'Sau khi nâng vật nặng'),
(9, 6, 21, '2025-06-27', '08:30:00', 'pending', 0, 'Mờ mắt, nhức mắt', 'Làm việc nhiều với máy tính'),
(9, 11, 18, '2025-06-28', '11:30:00', 'confirmed', 0, 'Đau bụng, buồn nôn', 'Sau khi ăn đồ cay'),

-- Patient 10 - Các khoa khác nhau
(10, 1, 2, '2025-06-26', '13:00:00', 'confirmed', 0, 'Đau ngực, khó thở', 'Khi leo cầu thang'),
(10, 4, 17, '2025-06-27', '16:00:00', 'pending', 0, 'Sốt cao, ho nhiều', 'Trẻ em 5 tuổi'),
(10, 8, 16, '2025-06-28', '09:00:00', 'confirmed', 0, 'Khám tổng quát định kỳ', 'Kiểm tra sức khỏe hàng năm'),

-- Patient 11 - Các khoa khác nhau
(11, 2, 3, '2025-06-26', '10:30:00', 'confirmed', 0, 'Mất ngủ, stress', 'Công việc áp lực cao'),
(11, 9, 25, '2025-06-27', '14:00:00', 'pending', 0, 'Chụp CT bụng', 'Theo dõi sau phẫu thuật'),
(11, 12, 23, '2025-06-28', '15:30:00', 'confirmed', 0, 'Đau vùng thắt lưng', 'Nam giới 45 tuổi'),

-- Patient 12 - Các khoa khác nhau
(12, 1, 2, '2025-06-26', '08:00:00', 'confirmed', 0, 'Tăng huyết áp', 'Có tiền sử gia đình'),
(12, 10, 22, '2025-06-27', '11:00:00', 'pending', 0, 'Tư vấn phòng chống ung thư', 'Người thân bị ung thư'),
(12, 13, 24, '2025-06-28', '13:30:00', 'confirmed', 0, 'Kiểm tra đường huyết', 'Tiền sử tiểu đường');

-- Insert additional sample data into queues
INSERT INTO queues (patient_id, clinic_id, record_id, appointment_id, status, priority, registered_online, qr_code) VALUES
-- Queue cho các appointment đã confirmed/completed (ID 1-25)
(10, 3, NULL, 3, 'waiting', 0, TRUE, 'QR001'), -- Appointment confirmed: patient 10, clinic 3, doctor 14
(11, 4, NULL, 4, 'waiting', 0, TRUE, 'QR002'), -- Appointment confirmed: patient 11, clinic 4, doctor 2  
(13, 6, NULL, 6, 'done', 0, TRUE, 'QR003'), -- Appointment completed: patient 13, clinic 6, doctor 14
(8, 1, NULL, 7, 'waiting', 0, TRUE, 'QR004'), -- Appointment confirmed: patient 8, clinic 1, doctor 2
(10, 3, NULL, 9, 'waiting', 0, TRUE, 'QR005'), -- Appointment confirmed: patient 10, clinic 3, doctor 14
(12, 11, NULL, 11, 'waiting', 0, TRUE, 'QR006'), -- Appointment confirmed: patient 12, clinic 11, doctor 2
(8, 9, NULL, 13, 'waiting', 0, TRUE, 'QR007'), -- Appointment confirmed: patient 8, clinic 9, doctor 2
(10, 13, NULL, 15, 'waiting', 0, TRUE, 'QR008'), -- Appointment confirmed: patient 10, clinic 13, doctor 14
(11, 1, NULL, 16, 'waiting', 0, TRUE, 'QR009'), -- Appointment confirmed: patient 11, clinic 1, doctor 2
(13, 4, NULL, 18, 'waiting', 0, TRUE, 'QR010'), -- Appointment confirmed: patient 13, clinic 4, doctor 14
(11, 8, NULL, 21, 'done', 0, TRUE, 'QR011'), -- Appointment completed: patient 11, clinic 8, doctor 2
(12, 9, NULL, 22, 'done', 0, TRUE, 'QR012'), -- Appointment completed: patient 12, clinic 9, doctor 3
(13, 10, NULL, 23, 'done', 0, TRUE, 'QR013'), -- Appointment completed: patient 13, clinic 10, doctor 14
(8, 8, NULL, 24, 'done', 2, TRUE, 'QR014'), -- Appointment completed: patient 8, clinic 8, doctor 2
(9, 1, NULL, 25, 'done', 2, TRUE, 'QR015'), -- Appointment completed: patient 9, clinic 1, doctor 3

-- Thêm queue cho các appointment confirmed mới (ID 26-40)
(8, 2, NULL, 26, 'waiting', 0, TRUE, 'QR051'), -- Appointment confirmed: patient 8, clinic 2, doctor 3
(8, 7, NULL, 28, 'waiting', 0, TRUE, 'QR053'), -- Appointment confirmed: patient 8, clinic 7, doctor 20
(9, 3, NULL, 29, 'waiting', 0, TRUE, 'QR054'), -- Appointment confirmed: patient 9, clinic 3, doctor 14
(9, 11, NULL, 31, 'waiting', 0, TRUE, 'QR056'), -- Appointment confirmed: patient 9, clinic 11, doctor 18
(10, 1, NULL, 32, 'waiting', 0, TRUE, 'QR057'), -- Appointment confirmed: patient 10, clinic 1, doctor 2
(10, 8, NULL, 34, 'waiting', 0, TRUE, 'QR059'), -- Appointment confirmed: patient 10, clinic 8, doctor 16
(11, 2, NULL, 35, 'waiting', 0, TRUE, 'QR060'), -- Appointment confirmed: patient 11, clinic 2, doctor 3
(11, 12, NULL, 37, 'waiting', 0, TRUE, 'QR062'), -- Appointment confirmed: patient 11, clinic 12, doctor 23
(12, 1, NULL, 38, 'waiting', 0, TRUE, 'QR063'), -- Appointment confirmed: patient 12, clinic 1, doctor 2
(12, 13, NULL, 40, 'waiting', 0, TRUE, 'QR065'); -- Appointment confirmed: patient 12, clinic 13, doctor 24

-- Insert sample data into doctor_ratings
INSERT INTO doctor_ratings (doctor_id, patient_id, appointment_id, rating, comment, is_anonymous) VALUES
-- Ratings for Dr. Nguyễn Văn Minh (ID: 2) - Tim mạch
(2, 8, 6, 4.5, 'Bác sĩ rất tận tâm và chuyên nghiệp. Giải thích bệnh tình rõ ràng, dễ hiểu.', FALSE),
(2, 11, 4, 5.0, 'Bác sĩ Minh rất giỏi, chẩn đoán chính xác và điều trị hiệu quả.', FALSE),
(2, 12, 11, 4.0, 'Bác sĩ có kinh nghiệm tốt, nhưng thời gian khám hơi nhanh.', FALSE),
(2, 8, 7, 4.8, 'Tái khám rất tốt, bệnh tình cải thiện rõ rệt.', FALSE),
(2, 10, 32, 4.2, 'Bác sĩ tận tâm nhưng phòng khám hơi đông.', FALSE),

-- Ratings for Dr. Trần Thị Lan (ID: 3) - Thần kinh  
(3, 9, 2, 4.7, 'Bác sĩ Lan rất hiểu tâm lý bệnh nhân, tư vấn rất hữu ích.', FALSE),
(3, 12, 5, 3.5, 'Bác sĩ có chuyên môn tốt nhưng ít nói chuyện.', FALSE),
(3, 11, 35, 4.9, 'Bác sĩ rất tận tâm, giải thích chi tiết về bệnh tình.', FALSE),
(3, 9, 25, 4.3, 'Khám cấp cứu nhanh chóng và hiệu quả.', FALSE),

-- Ratings for Dr. Trần Văn Nam (ID: 14) - Chấn thương chỉnh hình
(14, 10, 3, 4.6, 'Bác sĩ Nam rất giỏi về xương khớp, điều trị hiệu quả.', FALSE),
(14, 13, 6, 4.4, 'Bác sĩ tận tâm, hướng dẫn tập luyện chi tiết.', FALSE),
(14, 9, 29, 4.1, 'Bác sĩ có kinh nghiệm tốt nhưng cần cải thiện thái độ.', FALSE),
(14, 10, 9, 4.8, 'Tái khám rất tốt, khớp gối đã cải thiện nhiều.', FALSE),
(14, 13, 18, 4.0, 'Bác sĩ chuyên môn tốt nhưng thời gian chờ hơi lâu.', FALSE),

-- Anonymous ratings
(2, 8, NULL, 4.3, 'Bác sĩ rất tốt, nhưng tôi muốn giữ ẩn danh.', TRUE),
(3, 9, NULL, 4.7, 'Chất lượng khám bệnh rất tốt.', TRUE),
(14, 10, NULL, 4.5, 'Bác sĩ có chuyên môn cao.', TRUE),

-- Ratings for new doctors
(16, 8, 26, 4.2, 'Bác sĩ mới nhưng rất tận tâm.', FALSE),
(17, 9, 30, 4.6, 'Bác sĩ nhi khoa rất giỏi với trẻ em.', FALSE),
(18, 11, 31, 4.4, 'Bác sĩ tiêu hóa có kinh nghiệm tốt.', FALSE),
(19, 8, 27, 4.8, 'Bác sĩ da liễu rất chuyên nghiệp.', FALSE),
(20, 8, 28, 4.1, 'Bác sĩ tai mũi họng khám kỹ lưỡng.', FALSE),
(21, 9, 30, 4.3, 'Bác sĩ mắt có chuyên môn tốt.', FALSE),
(22, 12, 39, 4.7, 'Bác sĩ ung bướu rất tận tâm.', FALSE),
(23, 11, 37, 4.5, 'Bác sĩ tiết niệu có kinh nghiệm.', FALSE),
(24, 12, 40, 4.4, 'Bác sĩ nội tiết tư vấn rất hữu ích.', FALSE),
(25, 11, 36, 4.2, 'Bác sĩ chẩn đoán hình ảnh chuyên nghiệp.', FALSE);

-- Update doctor average ratings based on the ratings data
UPDATE doctors d 
SET rating = (
    SELECT ROUND(AVG(rating), 1)
    FROM doctor_ratings dr 
    WHERE dr.doctor_id = d.user_id
)
WHERE d.user_id IN (SELECT DISTINCT doctor_id FROM doctor_ratings);

-- Add new tables according to Prisma schema

-- Table for specialties
CREATE TABLE specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Table for medicines
CREATE TABLE medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- Table for password reset tokens
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    userId INT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_userId (userId)
);

-- Add new columns to doctors table
ALTER TABLE doctors 
ADD COLUMN specialty_id INT NULL AFTER user_id,
ADD COLUMN price INT DEFAULT 0 AFTER bio,
ADD FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL;

-- Add new columns to prescription_items table
ALTER TABLE prescription_items 
ADD COLUMN medicine_id INT NULL AFTER prescription_id,
ADD COLUMN quantity INT DEFAULT 1 AFTER medicine_id,
ADD FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL;

-- Insert sample data into specialties
INSERT INTO specialties (name) VALUES
('Tim mạch'),
('Thần kinh'),
('Chấn thương chỉnh hình'),
('Nhi khoa'),
('Da liễu'),
('Mắt'),
('Tai mũi họng'),
('Nội tổng quát'),
('Chẩn đoán hình ảnh'),
('Ung bướu'),
('Tiêu hóa'),
('Tiết niệu'),
('Nội tiết');

-- Insert sample data into medicines
INSERT INTO medicines (name, stock, price) VALUES
('Amoxicillin 500mg', 1000, 50000.00),
('Paracetamol 500mg', 2000, 15000.00),
('Ceftriaxone 1g', 500, 120000.00),
('Glucosamine 1500mg', 800, 80000.00),
('Loratadine 10mg', 1200, 25000.00),
('Atropin 1%', 300, 35000.00),
('Ibuprofen 400mg', 1500, 20000.00),
('Omeprazole 20mg', 1000, 45000.00),
('Metformin 500mg', 800, 30000.00),
('Amlodipine 5mg', 600, 40000.00);

-- Update doctors table to use specialty_id instead of specialty string
UPDATE doctors SET specialty_id = 1 WHERE specialty = 'Tim mạch';
UPDATE doctors SET specialty_id = 2 WHERE specialty = 'Thần kinh';
UPDATE doctors SET specialty_id = 3 WHERE specialty = 'Chấn thương chỉnh hình';
UPDATE doctors SET specialty_id = 4 WHERE specialty = 'Nhi khoa';
UPDATE doctors SET specialty_id = 5 WHERE specialty = 'Da liễu';
UPDATE doctors SET specialty_id = 6 WHERE specialty = 'Mắt';
UPDATE doctors SET specialty_id = 7 WHERE specialty = 'Tai mũi họng';
UPDATE doctors SET specialty_id = 8 WHERE specialty = 'Nội tổng quát';
UPDATE doctors SET specialty_id = 9 WHERE specialty = 'Chẩn đoán hình ảnh';
UPDATE doctors SET specialty_id = 10 WHERE specialty = 'Ung bướu';
UPDATE doctors SET specialty_id = 11 WHERE specialty = 'Tiêu hóa';
UPDATE doctors SET specialty_id = 12 WHERE specialty = 'Tiết niệu';
UPDATE doctors SET specialty_id = 13 WHERE specialty = 'Nội tiết';

-- Update prescription_items to use medicine_id
UPDATE prescription_items SET medicine_id = 1 WHERE medicine_name LIKE '%Amoxicillin%';
UPDATE prescription_items SET medicine_id = 2 WHERE medicine_name LIKE '%Paracetamol%';
UPDATE prescription_items SET medicine_id = 3 WHERE medicine_name LIKE '%Ceftriaxone%';
UPDATE prescription_items SET medicine_id = 4 WHERE medicine_name LIKE '%Glucosamine%';
UPDATE prescription_items SET medicine_id = 5 WHERE medicine_name LIKE '%Loratadine%';
UPDATE prescription_items SET medicine_id = 6 WHERE medicine_name LIKE '%Atropin%';

-- Set quantity for existing prescription items
UPDATE prescription_items SET quantity = 1 WHERE quantity IS NULL;

-- Add price to doctors (sample prices)
UPDATE doctors SET price = 300000 WHERE user_id = 2;  -- Tim mạch
UPDATE doctors SET price = 250000 WHERE user_id = 3;  -- Thần kinh
UPDATE doctors SET price = 350000 WHERE user_id = 14; -- Chấn thương chỉnh hình
UPDATE doctors SET price = 200000 WHERE user_id = 16; -- Nội tổng quát
UPDATE doctors SET price = 180000 WHERE user_id = 17; -- Nhi khoa
UPDATE doctors SET price = 280000 WHERE user_id = 18; -- Tiêu hóa
UPDATE doctors SET price = 220000 WHERE user_id = 19; -- Da liễu
UPDATE doctors SET price = 240000 WHERE user_id = 20; -- Tai mũi họng
UPDATE doctors SET price = 260000 WHERE user_id = 21; -- Mắt
UPDATE doctors SET price = 400000 WHERE user_id = 22; -- Ung bướu
UPDATE doctors SET price = 320000 WHERE user_id = 23; -- Tiết niệu
UPDATE doctors SET price = 270000 WHERE user_id = 24; -- Nội tiết
UPDATE doctors SET price = 380000 WHERE user_id = 25; -- Chẩn đoán hình ảnh

-- SET SQL_SAFE_UPDATES = 1;
ALTER TABLE queues
  ADD COLUMN queue_number INT,
  ADD COLUMN shift_type VARCHAR(20);
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  type ENUM('direct', 'group') DEFAULT 'direct',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_message_at DATETIME
);

CREATE TABLE conversation_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  userId INT NOT NULL,
  
  CONSTRAINT fk_conversation FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,

  UNIQUE KEY unique_participant (conversationId, userId)
);
CREATE TABLE chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  message_type ENUM('text', 'image', 'file', 'audio', 'video') DEFAULT 'text',
  toId INT NOT NULL,
  sendById INT NOT NULL,
  conversationId INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_chat_to FOREIGN KEY (toId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_send_by FOREIGN KEY (sendById) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_conversation FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
);
select *from users;

INSERT INTO conversations (name, type, last_message_at)
VALUES ('admin - drminh', 'direct', NOW());
SELECT LAST_INSERT_ID() AS conversationId;

-- admin (user_id = 1)
INSERT INTO conversation_participants (conversationId, userId)
VALUES (2, 1);

-- bác sĩ Minh (user_id = 2)
INSERT INTO conversation_participants (conversationId, userId)
VALUES (2, 2);

INSERT INTO chats (text, toId, sendById, conversationId, message_type, is_read)
VALUES ('Chào bác sĩ Minh!', 2, 1, 2, 'text', FALSE);
select * from doctors;