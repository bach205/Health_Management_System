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
  activeStatus: boolean;
  gender: string;
}

export interface IDoctor extends IUserBase {
  userType: "doctor";
  specialty: string;
  birthday : string;
  address : string;
}

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  activeStatus: boolean;
  userType: EmployeeType;
  birthday: string;
  address: string;
  gender: string;
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
