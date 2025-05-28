import { useEffect, useState } from "react";
import { getClinicService } from "../services/clinic.service";
import type { IClinicBase, IUserBase } from "../types/index.type";

export interface IPagination {
    total: number;
    pageSize: number;
    current: number;
}

export const useClinicList = (fetchagain1: boolean, fetchagain2: boolean) => {
    const [clinic, setClinic] = useState<IClinicBase[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
    const [sort, setSort] = useState<string>("stt");

    const [pagination, setPagination] = useState<IPagination>({
        total: 1,
        pageSize: 5,
        current: 1,
    });
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getClinicService();
                setPagination({
                    ...pagination,
                    total : data.data.metadata.clinics.length
                })
                const datafilter = data?.data.metadata.clinics as IClinicBase[];
                if(sort === 'name_asc') {
                    datafilter.sort((a, b) => {
                        return (a.name[0] ?? '').localeCompare(b.name[0] ?? '');
                    })
                } else if(sort === 'name_desc'){
                    datafilter.sort((a, b) => {
                        return (b.name[0] ?? '').localeCompare(a.name[0] ?? '');
                    })               
                }
                setClinic(datafilter.filter((item) => {
                    return item.name.includes(keyword)
                }));
                
                setLoading(false);
            } catch (error) {
                console.log(error)
                setLoading(false);
            }
        }
        fetchData();
    }, [sort, reload, fetchagain1, fetchagain2]);

    const handleTableChange = (pagination: IPagination) => {
        setPagination(pagination);
    };

    return {
        clinic,
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
