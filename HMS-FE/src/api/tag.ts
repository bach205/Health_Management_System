import instance from "./instance";
import type { ITag } from '../types/index.type';

export const getAllTags = () => instance.get<{ metadata: ITag[] }>('/api/v1/tag');
export const createTag = (name: string) => instance.post('/api/v1/tag', { name });
export const updateTag = (id: number, name: string) => instance.put(`/api/v1/tag/${id}`, { name });
export const deleteTag = (id: number) => instance.delete(`/api/v1/tag/${id}`);

