import {
    Col,
    Flex,
    Pagination,
    Row,
    Spin,
    Input,
    Button,
    message,
    Select,
    Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { specialtyOptions } from "../../constants/user.const";
import { useDoctorList } from "../../hooks/useDoctorList";
import { Search, Stethoscope } from "lucide-react";

const AllDoctor: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        users,
        specialty,
        pagination,
        loading,
        setSpecialty,
        setPagination,
        keyword,
        setKeyword,
        reload,
        setReload,
    } = useDoctorList({ pageSize: 8, current: 1 });

    useEffect(() => {
        const specialityQuery = searchParams.get("speciality");
        if (specialityQuery === "") {
            setSpecialty("all");
            return;
        }
        if (specialityQuery) {
            setSpecialty(specialityQuery);
        }
    }, []);
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="text-center text-2xl pt-10 pb-5 text-gray-500 uppercase"><p>Danh sách bác sĩ theo chuyên khoa</p></div>
            <Flex justify="space-between" align="center" className="w-full">
                <Flex gap={10} className="w-full">
                    <div className="flex items-center justify-start w-full">
                        <p className="text-gray-500 text-sm mr-2">Lọc theo chuyên khoa:</p>
                        <Select
                            value={specialty === "all" ? "" : specialty}
                            onChange={(value: string) => {
                                setSpecialty(value === "" ? "all" : value);
                                setSearchParams({ speciality: value });
                            }}
                            className="min-w-[200px]"
                            options={[
                                { label: "Tất cả", value: "" },
                                ...specialtyOptions
                                    .filter((opt) => opt.value !== "")
                                    .map((opt) => ({
                                        label: opt.label,
                                        value: opt.value,
                                    })),
                            ]}
                        />
                    </div>
                    <Input
                        placeholder="Tìm kiếm bác sĩ"
                        className="w-[200px]!"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Button type="primary" onClick={() => setReload(!reload)}>
                        <Search className="w-4 h-4" />
                    </Button>
                </Flex>

            </Flex>

            {/* Dropdown filter nằm ngay trên danh sách */}


            {/* Danh sách bác sĩ */}
            {loading ? (
                <div className="text-center w-full">
                    <Spin />
                </div>
            ) : (
                <Row className="w-full" gutter={[16, 16]}>
                    {users?.filter((user) => user.doctor.specialty !== "").map((user, index) => (
                        <Tooltip title={`Đặt lịch với bác sĩ ${user.full_name}`} color="#646CFF" mouseEnterDelay={0.35} >
                            <Col
                                span={24}
                                md={12}
                                lg={6}
                                onClick={() =>
                                    user.is_active
                                        ? navigate(`/book-appointment/${user.id}`)
                                        : message.error("Bác sĩ không hoạt động")
                                }
                                key={index}
                            >
                                <div className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500">
                                    <div className="flex justify-center items-center bg-blue-50">
                                        <img
                                            className="bg-blue-50 w-full"
                                            src={"https://placehold.jp/150x150.png"}
                                            alt={`Picture of ${user.full_name}`}
                                        />
                                    </div>
                                    <div className="p-4">
                                        {user.is_active ? (
                                            <div className="flex items-center gap-2 text-sm text-center text-green-500">
                                                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                                                <p>Hoạt động</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-center text-red-500">
                                                <p className="w-2 h-2 bg-red-500 rounded-full"></p>
                                                <p>Không hoạt động</p>
                                            </div>
                                        )}
                                        <p className="text-gray-900 text-lg font-medium">{user.full_name}</p>
                                        <Flex gap={10} align="center" className="w-full">
                                            <div className="flex items-center gap-1" data-rating="4.8">
                                                <label className="inline-block w-[12px] relative h-[20px]">
                                                    <div className="text-gray-500 absolute top-0 left-0 ">★</div>
                                                    <div className="text-yellow-500 absolute top-0 left-0 w-[12px] overflow-hidden">★</div>
                                                </label>
                                                <label className="inline-block w-[12px] relative h-[20px]">
                                                    <div className="text-gray-500 absolute top-0 left-0 ">★</div>
                                                    <div className="text-yellow-500 absolute top-0 left-0 w-[12px] overflow-hidden">★</div>
                                                </label>
                                                <label className="inline-block w-[12px] relative h-[20px]">
                                                    <div className="text-gray-500 absolute top-0 left-0 ">★</div>
                                                    <div className="text-yellow-500 absolute top-0 left-0 w-[12px] overflow-hidden">★</div>
                                                </label>
                                                <label className="inline-block w-[12px] relative h-[20px]">
                                                    <div className="text-gray-500 absolute top-0 left-0 ">★</div>
                                                    <div className="text-yellow-500 absolute top-0 left-0 w-[12px] overflow-hidden">★</div>
                                                </label>

                                                <label className="inline-block w-[12px] relative h-[20px]">
                                                    <div className="text-gray-500 absolute top-0 left-0 ">★</div>
                                                    <div className="text-yellow-500 absolute top-0 left-0 w-[6px] overflow-hidden">★</div>
                                                </label>

                                            </div>
                                            <p className="text-gray-600 text-sm"><span className="font-medium">4.8</span> trên 5</p>
                                        </Flex>
                                        <Flex gap={10} align="center" className="mt-2! w-full">
                                            <Stethoscope className="w-5 h-5" color="#646CFF" />
                                            <p className="text-gray-600 text-md ">{specialtyOptions.find((opt) => opt.value === user.doctor.specialty)?.label || "Khoa"}</p>
                                        </Flex>
                                    </div>
                                </div>
                            </Col>

                        </Tooltip>
                    ))}

                    {users && users.length > 0 ? (
                        <Col span={24}>
                            <Pagination
                                className="flex justify-center"
                                current={pagination.current}
                                total={pagination.total}
                                pageSize={8}
                                onChange={(page, pageSize) =>
                                    setPagination({ ...pagination, current: page, pageSize: pageSize })
                                }
                            />
                        </Col>
                    ) : (
                        <Col span={24}>
                            <p className="text-center text-gray-600">Không có bác sĩ nào</p>
                        </Col>
                    )}
                </Row>
            )}
        </div>
    );
};

export default AllDoctor;
