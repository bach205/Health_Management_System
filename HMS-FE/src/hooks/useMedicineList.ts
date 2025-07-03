import { useEffect, useState } from "react";
import type { IMedicine, IPagination } from "../types/index.type";
import { message } from "antd";
import { getMedicines } from "../services/medicine.service";

export const useMedicineList = (initialPagination?: Partial<IPagination>, sortBy?: string) => {
    const [medicines, setMedicines] = useState<IMedicine[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
    const [sort, setSort] = useState<string>(sortBy || "name_asc");
    const [isActive, setIsActive] = useState<string>("all");
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        pageSize: initialPagination?.pageSize || 10,
        current: initialPagination?.current || 1,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const searchOptions = {
                    searchKey: keyword,
                    sortBy: sort,
                    skip: (pagination.current - 1) * pagination.pageSize,
                    limit: pagination.pageSize,
                    isActive,
                };
                console.log("searchOptions", searchOptions)
                const res = await getMedicines(searchOptions);
                console.log(res.data.metadata);
                setMedicines(res.data.metadata.medicines);
                setPagination((prev) => ({
                    ...prev,
                    total: res.data.metadata.total,
                }));
                setLoading(false);

            } catch (error: any) {
                console.log(error)
                if (error?.response?.data?.errors) {
                    message.error(error.response.data.errors[0]);
                }
                else if (error?.errorFields?.length > 0) {
                    message.error(error.errorFields[0].errors[0]);
                }
                else if (error?.response?.data?.message) {
                    message.error(error.response.data.message);
                }
                else {
                    message.error("Lỗi khi tải danh sách bác sĩ");
                }
                setLoading(false);
            }
        };
        fetchData();
    }, [reload, pagination.current, sort, isActive]);

    const handleTableChange = (pagination: IPagination) => {
        setPagination(pagination);
    };

    return {
        medicines,
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
        isActive,
        setIsActive,
        handleTableChange,
    };
};
