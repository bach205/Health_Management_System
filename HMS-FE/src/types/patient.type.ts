// Thông tin thuốc
export interface Medicine {
  id: number;
  name: string;
  stock: number;
  price: string;
}

// Thuốc đã kê trong đơn
export interface PrescriptionItem {
  id: number;
  record_id: number;
  medicine_id: number;
  note: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  medicine: Medicine;
  quantity?: number; // Số lượng thuốc
}

// Lịch sử khám bệnh
export interface Record {
  id: number;
  patient_id: number;
  clinic_id: number;
  doctor_id: number;
  result: string;
  note: string;
  examined_at: string;
  created_at: string;
  updated_at: string;
  prescriptionItems: PrescriptionItem[];
  doctor?: {
    user_id: number;
    specialty_id?: number;
    bio?: string;
    price?: number;
    user: User;
  };
  clinic?: {
    id: number;
    name: string;
    description?: string;
  };
}

// Thông tin user
export interface User {
  id: number;
  email: string;
  password: string | null;
  full_name: string;
  phone: string;
  role: string;
  address: string;
  date_of_birth: string;
  gender: string;
  avatar: string | null;
  sso_provider: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Thông tin bệnh nhân
export interface Patient {
  id: number;
  identity_number: string;
  created_at: string;
  updated_at: string;
  user: User;
  records: Record[];
}