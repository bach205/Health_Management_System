import { useEffect, useState } from "react";
import { getAllSpecialties, getSpecialties } from "../services/specialty.service";
import type { ISpecialty, IPagination } from "../types/index.type";
import { message } from "antd";

export const useSpecialtyList = (initialPagination?: Partial<IPagination>, getAll?: boolean) => {
  const [specialties, setSpecialties] = useState<ISpecialty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");
  const [reload, setReload] = useState<boolean>(false);
  const [sort, setSort] = useState<string>("name_asc");
  const [pagination, setPagination] = useState<IPagination>({
    total: 0,
    pageSize: initialPagination?.pageSize || 10,
    current: initialPagination?.current || 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

        if (getAll) {
          const res = await getAllSpecialties();
          setSpecialties(res.data.metadata.specialties);
        } else {
          const searchOptions = {
            searchKey: keyword,
            sortBy: sort,
            skip: (pagination.current - 1) * pagination.pageSize,
            limit: pagination.pageSize,
          };
          // console.log("specialty searchOptions", searchOptions);
          const res = await getSpecialties(searchOptions);
          console.log("res", res)
          // console.log("specialties:", res.data.metadata);
          setSpecialties(res.data.metadata.specialties);
          setPagination((prev) => ({
            ...prev,
            total: res.data.metadata.total,
          }));
        }
      } catch (error: any) {
        console.error(error);
        if (error?.response?.data?.errors) {
          message.error(error.response.data.errors[0]);
        } else if (error?.errorFields?.length > 0) {
          message.error(error.errorFields[0].errors[0]);
        } else if (error?.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error("Lỗi khi tải danh sách chuyên khoa");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reload, pagination.current, sort]);

  const handleTableChange = (pagination: IPagination) => {
    setPagination(pagination);
  };

  return {
    specialties,
    loading,
    keyword,
    setKeyword,
    reload,
    setReload,
    sort,
    setSort,
    pagination,
    setPagination,
    setLoading,
    handleTableChange,
  };
};
