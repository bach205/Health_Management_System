import instance from "../api/mainRequest";

const BASE_URL = "api/v1/blog";
const CATEGORY_URL = "api/v1/blog-category";

export const getBlogCategoriesNoPagination = async (params?: { page?: number; pageSize?: number; order?: 'asc' | 'desc' }) => {
    return instance.get(CATEGORY_URL, { params });
};
export const getBlogCategories = async () => {
    return instance.get(`${CATEGORY_URL}/all/nopageination`);
};

export const createBlogCategory = async (data: { name: string }) => {
    return instance.post(CATEGORY_URL, data);
};

export const updateBlogCategory = async (id: number, data: { name: string }) => {
    return instance.put(`${CATEGORY_URL}/${id}`, data);
};

export const deleteBlogCategory = async (id: number) => {
    return instance.delete(`${CATEGORY_URL}/${id}`);
};

export const getBlogs = async (params: any) => {
    return instance.get(`${BASE_URL}`, { params });
};

export const createBlog = async (blogData: any) => {
    return instance.post(`${BASE_URL}/`, blogData);
};

export const deleteBlog = async (id: number) => {
    return instance.delete(`${BASE_URL}/${id}`);
};

export const updateBlog = async (id: number, blogData: any) => {
    return instance.put(`${BASE_URL}/${id}`, blogData);
};

export const getBlogById = async (id: number) => {
    return instance.get(`${BASE_URL}/${id}`);
}