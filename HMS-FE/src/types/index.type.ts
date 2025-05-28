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
}

export interface IDoctor extends IUserBase {
  role: "doctor";
<<<<<<< HEAD
  specialty: string; // Khoa     
  bio?: string;
=======
  doctor: {
    specialty?: string; // Khoa
    bio?: string;
  }
>>>>>>> master
}


export interface IPatient extends IUserBase {
  role: "patient";
<<<<<<< HEAD
  identityNumber: string;
=======
  identity_number?: string;
>>>>>>> master
}


export type EmployeeType = keyof typeof TYPE_EMPLOYEE;
