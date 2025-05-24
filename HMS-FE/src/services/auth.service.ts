import mainRequest from "@/api/mainRequest";

export const loginService = async (email: string, password: string) => {
  const response = await mainRequest.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};
