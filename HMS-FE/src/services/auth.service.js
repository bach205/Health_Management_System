import mainRequest from "../api/mainRequest";

export const loginService = async (email, password) => {
    const response = await mainRequest.post("/auth/login", { email, password, });
    return response.data;
}; 