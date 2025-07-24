import instance from "./instance";

const BASE_URL = "user";

export const createUser = (user: any) => {
  return instance.post(`${BASE_URL}/create`, user);
};

export const getUsers = async (body: Record<string, any>) => {
const data = {
  users: [
    {
      _id: "000000000000000000000001",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000002",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000003",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000004",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000005",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000006",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000007",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000008",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000009",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000010",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    },
    {
      _id: "000000000000000000000011",
      fullName: "bacsi1",
      email: "bacsi@gmail.com",
      phone: "9999999999",
      password: "$2b$09$xnB.y1uRcrrPQaGOgF3OZuUMeEQL1AgwPLDNcb55.N0k0j3n73h5e",
      activeStatus: true,
      userType: "doctor",
      birthday: "2025-05-14T17:00:00.000Z",
      address: "aa",
      gender: "male",
      specialty: "general"
    }
  ]
};

  // return instance.post(`${BASE_URL}`, body);
  return data;
};

export const updateUser = (id: string | number, body: Record<string, any>) => {
  return instance.put(`${BASE_URL}/update/${id}`, body);
};

export const getUserById = (id: string | number) => {
  return instance.get(`${BASE_URL}/${id}`);
};

