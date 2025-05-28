import  mainRequest from "../api/mainRequest";

const baseURL = `http://localhost:8080/api/v1/auth`;

export const registerService = async (body : object) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.post(`${baseURL}/register`, data);

  return response;
};

export const loginService = async (body : object) => {
  const data = JSON.stringify(body);
  const response = await mainRequest.post(`${baseURL}/login`, data);
 
  return response;
};
