import  mainRequest from "./mainRequest";

const baseURL = `/api/v1/`;

export const register = async (body : object) => {
  const data = JSON.stringify(body);  
  const response = await mainRequest.post(`${baseURL}/register`, data);
  
  return response;
};

export const login = async (body : object) => {
  const data = JSON.stringify(body);
  const response = await mainRequest.post(`${baseURL}/login`, data);
  return response;
};

// export const reAuth = async (body) => {
//   const response = await mainRequest.post(`${baseURL}/reauth`, body);

//   return response;
// };

// export const changePassword = async (body) => {
//   const response = await mainRequest.post(`${baseURL}/change-password`, body);

//   return response;
// };

// export const resetPassword = (body) => {
//   return mainRequest.put(`${baseURL}/reset-password`, body);
// };
