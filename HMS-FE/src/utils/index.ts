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
  role: "admin" | "doctor" | "patient";  
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

export const PASSWORD_DEFAULT = "123456";
