import { useEffect, useState } from "react";
import { getDoctors } from "../services/doctor.service";
import type { IDoctor, IPagination } from "../types/index.type";


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
                }

                const res = await getDoctors(searchOptions)
                console.log('res: ', res)
                setUsers(res.data.metadata.doctors);
                setLoading(false);
            } catch (error) {
                console.log(error)
                setLoading(false);
            }
        }
        fetchData();
    }, [keyword, reload, pagination, specialty, sort]);

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
