export const TYPE_EMPLOYEE = {
    admin: "admin",
    user: "user",
    doctor: "doctor",
    nurse: "nurse",
    patient: "patient",
};


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
    nurse: "Y tá",
    patient: "Bệnh nhân"
};

export const colorOfType = {
    admin: "red",
    doctor: "green",
    user: "purple",
    nurse: "blue",
    patient: "yellow",
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
