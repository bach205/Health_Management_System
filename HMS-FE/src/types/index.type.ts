import type { TYPE_EMPLOYEE } from "../constants/user.const";
export interface IPagination {
  total: number;
  pageSize: number | undefined;
  current: number;
}


export interface IUserBase {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  gender: "male" | "female";
  date_of_birth: string;
  role: "admin" | "doctor" | "patient" | "nurse";
  address: string;
  sso_provider?: "google" | "facebook" | "local";
  is_active: boolean;
  avatar?: string;
}

export interface IDoctor extends IUserBase {
  role: "doctor";
  doctor: {
    specialty?: ISpecialty; // Khoa
    bio?: string;
    rating?: number;
    price?: number; // Giá khám
  }
}

export interface IShift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface IPatient extends IUserBase {
  role: "patient";
  identity_number?: string;
}
export interface IClinicBase {
  id: String,
  name: String,
  description: String,
}



export interface IPatient extends IUserBase {
  role: "patient";
  identityNumber: string;
}

export interface ISpecialty {
  id: number;
  name: string;
}

export interface IMedicine {
  id: number;
  name: string;
  // price: number;
  note?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  dosageAmount?: number;
  dosageUnit?: string;
  frequencyAmount?: number;
  frequencyUnit?: string;
  quantity?: number; // Số lượng thuốc
  stock?: number; // Số lượng tồn kho
}

export type EmployeeType = keyof typeof TYPE_EMPLOYEE;


export interface IBlogCategory {
  id: number;
  name: string;
}

export interface IBlog {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  published: boolean;
  category?: IBlogCategory;
}
