import { useEffect, useState } from "react";
import { getPatients } from "../services/patient.service";
import type { IPatient } from "../types/index.type";

interface UsePatientListProps {
    pageSize?: number;
    current?: number;
}

export const usePatientList = (props?: UsePatientListProps) => {
    const [users, setUsers] = useState<IPatient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string>("");
    const [reload, setReload] = useState<boolean>(false);
    const [sort, setSort] = useState<string>("newest");
    const [isActive, setIsActive] = useState<string>("all");
    const [pagination, setPagination] = useState({
        current: props?.current || 1,
        pageSize: props?.pageSize || 10,
        total: 0,
    });

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await getPatients({
                keyword,
                sort,
                isActive,
                page: pagination.current,
                pageSize: pagination.pageSize,
            });
            // console.log(response);
            setUsers(response.data.metadata.patients);
            setPagination(prev => ({
                ...prev,
                total: response.data.metadata.pagination.total,
            }));
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [ sort, isActive, pagination.current, pagination.pageSize, reload]);

    const handleTableChange = (pagination: any) => {
        setPagination(prev => ({
            ...prev,
            current: pagination.current,
            pageSize: pagination.pageSize,
        }));
    };

    return {
        users,
        loading,
        keyword,
        reload,
        sort,
        isActive,
        pagination,
        setKeyword,
        setReload,
        setSort,
        setIsActive,
        handleTableChange,
    };
}; 