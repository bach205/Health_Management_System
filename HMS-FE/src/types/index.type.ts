import type { TYPE_EMPLOYEE } from "../constants/user.const";

export interface IUserBase {
  id: string;
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
