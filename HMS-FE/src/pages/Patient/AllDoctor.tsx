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
import { useDoctorList } from "../../hooks/useDoctorList";
import { Search, Stethoscope } from "lucide-react";
import Rating from "./Rating";
import { useSpecialtyList } from "../../hooks/useSpecialtyList";
import "./Alldoctor.css";
import Title from "antd/es/typography/Title";

const AllDoctor: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const specialityQuery = searchParams.get("speciality");
    console.log(specialityQuery)
    const [doctors, setDoctors] = useState<any[]>([]);
    const {
        users,
        specialty,
        pagination,
        loading,
        setLoading,
        setSpecialty,
        setPagination,
        keyword,
        setKeyword,
        reload,
        setReload,
    } = useDoctorList({ pageSize: 8, current: 1 }, [specialityQuery || "all"]);

    // useEffect(() => {
    //     setLoading(true);
    //     const specialityQuery = searchParams.get("speciality");
    //     console.log('specialityQuery', specialityQuery)
    //     if (specialityQuery === "" || specialityQuery === null) {
    //         setSpecialty(['all']);git
    //         return;
    //     }
    //     if (specialityQuery) {
    //         setSpecialty([specialityQuery]);
    //     }
    // }, [reload]);

    useEffect(() => {
        setDoctors(users);
    }, [users]);

    const { specialties } = useSpecialtyList({ pageSize: 8, current: 1 }, true);

    return (
        <div style={{ padding: '24px' }} className="flex flex-col gap-4 w-full min-h-[250px] overflow-hidden">
            <Title level={3} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
                Danh sách bác sĩ theo chuyên khoa
            </Title>
            {/* <div className="text-center text-2xl pt-10 pb-5 text-gray-500 uppercase"><p>Danh sách bác sĩ theo chuyên khoa</p></div> */}
            <Flex justify="space-between" align="center" className="w-full">
                <Flex gap={10} className="w-full">
                    <div className="flex items-center justify-start w-full">
                        <p className="text-gray-500 text-sm mr-2">Lọc theo chuyên khoa:</p>
                        <Select
                            mode="multiple"
                            defaultValue={[]}
                            placeholder="Chọn chuyên khoa"
                            value={specialty.length > 0 ? specialty : []}
                            onChange={(value: string[]) => {
                                if (value.length === 0) {
                                    setSpecialty(['all']);
                                    setSearchParams({ speciality: "" });
                                    return;
                                }
                                if (value[0] === "all" && value.length === 1) {
                                    setSpecialty(['all']);
                                    setSearchParams({ speciality: "" });
                                    return;
                                }

                                if (value[value.length - 1] === ("all") && value.length > 1) {
                                    setSpecialty(['all']);
                                    setSearchParams({ speciality: "" });
                                    return;
                                }

                                const queryOptions = value.filter((opt) => opt !== "all");
                                setSpecialty(queryOptions);
                                setSearchParams({ speciality: queryOptions });
                            }}
                            className="w-2/5"
                            options={[
                                {
                                    label: "Tất cả",
                                    value: "all",
                                },
                                ...specialties
                                    .map((opt) => ({
                                        label: opt.name,
                                        value: opt.name,
                                    })),
                            ]}
                        />
                    </div>
                    <Input
                        placeholder="Tìm Bác Sĩ theo tên"
                        className="w-[250px]!"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <Button type="primary" onClick={() => setReload(!reload)}>
                        <Search className="w-4 h-4" />
                    </Button>
                </Flex>

            </Flex>

            {/* Danh sách bác sĩ */}
            {loading ? (
                <div className="text-center w-full">
                    <Spin />
                </div>
            ) : (
                <Row className="w-full" gutter={[16, 16]}>
                    {users?.map((user, index) => (
                        <Tooltip
                            title={`Đặt lịch với bác sĩ ${user.full_name}`}
                            color="#646CFF"
                            mouseEnterDelay={0.35}
                            key={index}
                        >
                            <Col
                                span={24}
                                md={12}
                                lg={6}
                                onClick={() =>
                                    user.is_active
                                        ? navigate(`/book-appointment/${user.id}`)
                                        : message.error("Bác sĩ không hoạt động")
                                }
                            >
                                <div
                                    className="card-doctor"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-in-out">
                                        <div className="flex justify-center items-center bg-blue-50 h-[324.4px] w-full overflow-hidden">
                                            <img
                                                className="h-full w-full object-cover"
                                                src={user.avatar || "https://placehold.jp/150x150.png"}
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
                                            <Rating rating={user.avg_rating || 0} />
                                            <Flex gap={10} align="center" className="mt-2! w-full">
                                                <Stethoscope className="w-5 h-5" color="#646CFF" />
                                                <p className="text-gray-600 text-md ">
                                                    {user.doctor?.specialty?.name || "Không xác định"}
                                                </p>
                                            </Flex>
                                        </div>
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

                                showSizeChanger={false}

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
