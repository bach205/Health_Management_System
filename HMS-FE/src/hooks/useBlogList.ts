import { useEffect, useState } from "react";
import { message } from "antd";
import { getBlogs } from "../services/blog.service";
import type { IBlog } from "../types/index.type";

export const useBlogList = (initialPagination?: any, initialPublished?: string) => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");
  const [reload, setReload] = useState<boolean>(false);
  const [published, setPublished] = useState<string>(initialPublished || "all");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: initialPagination?.pageSize || 10,
    current: initialPagination?.current || 1,
  });

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pagination.current,
          pageSize: pagination.pageSize,
        };

        if (published !== "all") params.published = published;
        if (categoryId) params.category_id = categoryId;
        if (keyword) params.keyword = keyword;

        const res = await getBlogs(params);
        const data = res.data.metadata;

        setBlogs(data.blogs);
        setPagination((prev) => ({ ...prev, total: data.total }));
      } catch (error: any) {
        message.error(error?.response?.data?.message || "Lỗi khi tải danh sách bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [pagination.current, pagination.pageSize, reload, published, categoryId]);

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  return {
    blogs,
    loading,
    keyword,
    setKeyword,
    published,
    setPublished,
    categoryId,
    setCategoryId,
    pagination,
    setPagination,
    reload,
    setReload,
    handleTableChange,
  };
};
