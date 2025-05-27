import { useEffect, useState } from "react";
import { getDoctors } from "../api/doctor";
import type { IDoctor } from "../utils";

export interface IPagination {
    total: number;
    pageSize: number;
    current: number;
}

export const useDoctorList = () => {
    const [users, setUsers] = useState<IDoctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
    const [specialty, setSpecialty] = useState<string>("all");
    const [sort, setSort] = useState<string>("stt");

    const [pagination, setPagination] = useState<IPagination>({
        total: 0,
        pageSize: 10,
        current: 1,
    });

    useEffect(() => {
        // console.log('call use')
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getDoctors({})
                // console.log(data)
                setUsers(data?.users);

                setLoading(false);
            } catch (error) {
                console.log(error)
                setLoading(false);
            }
        }
        fetchData();
    }, [keyword, reload]);

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
        handleTableChange,
    };
};
