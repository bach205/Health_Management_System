import instance from "../api/mainRequest";
import type { ISpecialty } from "../types/index.type";

const BASE_URL = "api/v1/specialty";

export const createSpecialty = (specialty: ISpecialty) => {
  return instance.post(`${BASE_URL}/create`, specialty);
};

export const getSpecialties = async (searchOptions: any) => {
  return instance.post(`${BASE_URL}`, searchOptions);
};

export const getAllSpecialties = async () => {
  return instance.get(`${BASE_URL}`);
};

export const updateSpecialty = (specialty: ISpecialty, id: number) => {
  return instance.post(`${BASE_URL}/update/${id}`, specialty);
};

export const getSpecialtyById = (id: number) => {
  return instance.get(`${BASE_URL}/${id}`);
};

export const deleteSpecialty = (id: number) => {
  return instance.delete(`${BASE_URL}/delete/${id}`);
};
