import instance from "../api/mainRequest";

const BASE_URL = "api/v1/blog";

export const getBlogCategories = async () => {
    return instance.get(`api/v1/blog-category`);
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