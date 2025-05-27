export const TYPE_EMPLOYEE = {
  admin: "admin",
  user: "user",
  doctor: "doctor",
};

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


export const TYPE_EMPLOYEE_STR = {
  admin: "Quản lý",
  user: "Người dùng",
  doctor: "Bác sĩ",
  nurse: "Y tá",
  patient: "Bệnh nhân"
};

export const TYPE_EMPLOYEE_STR_SHORT = {
  admin: "Quản lý",
  user: "Người dùng",
  doctor: "Bác sĩ",
};

export const colorOfType = {
  admin: "red",
  doctor: "green",
  user: "purple",
};

export const specialtyOptions = [
  { value: "general", label: "Nội trú" },
  { value: "pediatrics", label: "Nhi khoa" },
  { value: "orthopedics", label: "Chỉnh hình" },
  { value: "dermatology", label: "Da liễu" },
  { value: "ophthalmology", label: "Mắt" },
  { value: "dentistry", label: "Nha khoa" },
  { value: "psychiatry", label: "Tâm thần học" },
  { value: "oncology", label: "Ung thư" },
  { value: "neurology", label: "Thần kinh học" },
  { value: "other", label: "Đa khoa" }
];

export const PASSWORD_DEFAULT = "123456";
