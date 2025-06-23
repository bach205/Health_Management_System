import type { TYPE_EMPLOYEE } from "../constants/user.const";
export interface IPagination {
  total: number;
  pageSize: number;
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
    specialty?: string; // Khoa
    bio?: string;
    rating?: number;
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
  id : String,
  name : String,
  description : String,
}

export interface IDoctor extends IUserBase {
  role: "doctor";
  specialty: string; // Khoa     
  bio?: string;
}


export interface IPatient extends IUserBase {
  role: "patient";
  identityNumber: string;
}


export type EmployeeType = keyof typeof TYPE_EMPLOYEE;
