export const TYPE_EMPLOYEE = {
  admin: "admin",
  user: "user",
  doctor: "doctor",
};

export interface IUserBase {
  _id: string;                       
  fullName: string;                
  email: string;                   
  phone: string;                   
  password: string;           
  gender: "male" | "female";       
  birthday: string;            
  userType: "admin" | "doctor" | "patient";  
  address: string;                
  ssoProvider?: "google" | "facebook" | "local";  
  activeStatus: boolean;                         
}

export interface IDoctor extends IUserBase {
  userType: "doctor";                 
  specialty: string;             
  bio?: string;                  
}

export interface IPatient extends IUserBase {
  userType: "patient";
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
