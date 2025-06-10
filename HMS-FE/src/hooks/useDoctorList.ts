import { useEffect, useState } from "react";
import { getDoctors } from "../services/doctor.service";
import type { IDoctor, IPagination } from "../types/index.type";
import { message } from "antd";

export const useDoctorList = () => {
    const [users, setUsers] = useState<IDoctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
    const [specialty, setSpecialty] = useState<string>("all");
    const [sort, setSort] = useState<string>("newest");
    const [isActive, setIsActive] = useState<string>("all");
    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        pageSize: 10,
        current: 1,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const searchOptions = {
                    searchKey: keyword,
                    specialty: specialty,
                    sortBy: sort,
                    skip: (pagination.current - 1) * pagination.pageSize,
                    limit: pagination.pageSize,
                    isActive: isActive,
                }

                const res = await getDoctors(searchOptions)
                // console.log('res: ', res)
                setUsers(res.data.metadata.doctors);
                setPagination({ ...pagination, total: res.data.metadata.total })
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
        }
        fetchData();
    }, [reload, pagination.current, pagination.pageSize, specialty, sort, isActive]);

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
        isActive,
        setIsActive,
        handleTableChange,
    };
};
