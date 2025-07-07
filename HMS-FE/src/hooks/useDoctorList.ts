import { useEffect, useState } from "react";
import { getDoctors } from "../services/doctor.service";
import type { IDoctor, IPagination } from "../types/index.type";
import { message } from "antd";

export const useDoctorList = ( initialPagination?: Partial<IPagination>,initialSpecialty?: string[]) => {
    const [users, setUsers] = useState<IDoctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
    const [specialty, setSpecialty] = useState<string[]>(initialSpecialty || []);
    const [sort, setSort] = useState<string>("newest");
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
                    specialty,
                    sortBy: sort,
                    skip: (pagination.current - 1) * pagination.pageSize,
                    limit: pagination.pageSize,
                    isActive,
                };
                console.log("searchOptions", searchOptions)
                const res = await getDoctors(searchOptions);
                console.log(res.data.metadata);
                setUsers(res.data.metadata.doctors);
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
    }, [reload, pagination.current, specialty, sort, isActive]);

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            current: 1,
        }));
    }, [specialty]);

    // useEffect(() => {
    //     setPagination({ ...pagination, current: 1 })
    // }, [specialty])

    const handleTableChange = (pagination: IPagination) => {
        setPagination(pagination);
    };

    return {
        users,
        loading,
        keyword,
        setKeyword,
        reload,
        setReload,
        specialty,
        setSpecialty,
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
