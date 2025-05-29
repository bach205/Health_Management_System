import { useEffect, useState } from "react";
import { getAllNurse } from "../api/nurse.ts";
import type { IUserBase } from "../types/index.type";

export interface IPagination {
    total: number;
    pageSize: number;
    current: number;
}

export const useNurseList = () => {
    const [users, setUsers] = useState<IUserBase[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
    const [sort, setSort] = useState<string>("name_asc");

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
                console.log(keyword)
                const data = await getAllNurse({ keyword: keyword, sort: sort })
                console.log(data)
                setUsers(data?.data.metadata);

                setLoading(false);
            } catch (error) {
                console.log(error)
                setLoading(false);
            }
        }
        fetchData();
    }, [reload]);

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
        sort,
        setSort,
        pagination,
        setPagination,
        handleTableChange,
    };
};
