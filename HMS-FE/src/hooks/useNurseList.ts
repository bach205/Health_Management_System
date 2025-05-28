import { useEffect, useState } from "react";
import { getNurses } from "../services/nurse.service";
import type { IPagination, IUserBase } from "../types/index.type";



export const useNurseList = () => {
    const [users, setUsers] = useState<IUserBase[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
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
                const data = await getNurses({})
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
        sort,
        setSort,
        pagination,
        setPagination,
        handleTableChange,
    };
};
