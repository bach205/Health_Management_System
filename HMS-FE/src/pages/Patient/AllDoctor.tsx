import { Col, Flex, Pagination, Row, Spin, Input, Button, message } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { specialtyOptions } from "../../constants/user.const";
import { useDoctorList } from "../../hooks/useDoctorList";
import { Search } from "lucide-react";


const AllDoctor: React.FC = () => {
    // const { specialty } = useParams<{ specialty?: string }>();
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        users, specialty, pagination, loading,
        setSpecialty, setPagination, keyword, setKeyword, reload, setReload
    } = useDoctorList({ pageSize: 8, current: 1 });

    useEffect(() => {
        const specialityQuery = searchParams.get('speciality');
        if (specialityQuery === "" ) {
            setSpecialty("all")
            return
        }
        if (specialityQuery) {
            setSpecialty(specialityQuery);
        }

    }, []);

    // useEffect(() => {
    //     setPagination({ ...pagination, current: 1 })
    // }, [specialty])

    return (
        <div className="flex flex-col items-center sm:items-start">
            <Flex justify="space-between" align="center" className="w-full">
                <p className="text-gray-600">Danh sách bác sĩ theo chuyên khoa.</p>
                <Flex gap={10}>
                    <Input placeholder="Tìm kiếm bác sĩ" className="w-[200px]!" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                    <Button type="primary" onClick={() => setReload(!reload)}><Search className="w-4 h-4"></Search></Button>
                </Flex>
            </Flex>

            <div className="flex w-full h-full flex-col sm:flex-row items-center sm:items-start gap-5 mt-5">
                <button
                    className={`py-1 px-3 border rounded text-sm transition-all sm:hidden 
                        ${showFilter ? "bg-primary text-white" : ""}`}
                    onClick={() => setShowFilter((prev) => !prev)}
                >
                    Lọc
                </button>
                <div className={`flex-col gap-4 text-sm text-gary-600 ${showFilter ? "flex" : "hidden sm:flex"}`} >
                    {specialtyOptions.map((item, index) => (
                        <p key={index}
                            onClick={() => {
                                if (item.value === "") {
                                    setSearchParams({ speciality: item.value })
                                    setSpecialty("all")
                                    return
                                }
                                setSpecialty(item.value)
                                setSearchParams({ speciality: item.value })
                            }}
                            className={`w-[200px] pl-3 py-1.5 border border-gray-300 rounded transition-all cursor-pointer ${(specialty === item.value || (specialty === "all" && item.value === ""))
                                ? "bg-indigo-100 text-black"
                                : ""
                                }`}
                        >
                            {item.value === "" ? "Tất cả" : item.label}
                        </p>
                    ))}
                </div>
                {loading ? <div className="text-center w-full"><Spin></Spin></div> :
                    <Row className="w-full" gutter={[16, 16]} >
                        {users?.filter((doctor) => doctor.specialty !== "").map((doctor, index) => (
                            <Col span={24} md={12} lg={6}
                                onClick={() => doctor.is_active ? navigate(`/book-appointment/${doctor.id}`) : message.error("Bác sĩ không hoạt động")}
                                key={index}
                            >
                                <div className="border  border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500">
                                    <div className="flex justify-center items-center bg-blue-50 ">
                                        <img className="bg-blue-50 w-full" src={"https://placehold.jp/150x150.png"} alt={`Picture of ${doctor.full_name}`} />
                                    </div>
                                    <div className="p-4">
                                        {doctor.is_active ?
                                            <div className="flex items-center gap-2 text-sm text-center text-green-500">
                                                <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                                                <p>Hoạt động</p>
                                            </div>
                                            :
                                            <div className="flex items-center gap-2 text-sm text-center text-red-500">
                                                <p className="w-2 h-2 bg-red-500 rounded-full"></p>
                                                <p>Không hoạt động</p>
                                            </div>
                                        }
                                        <p className="text-gray-900 text-lg font-medium">{doctor.full_name}</p>
                                        <p className="text-gray-600 text-sm">{doctor.specialty}</p>
                                    </div>
                                </div>
                            </Col>
                        ))}
                        {(users && users?.length > 0) ? (
                            <Col span={24}>
                                <Pagination
                                    className="flex justify-center"
                                    current={pagination.current}
                                    total={pagination.total}
                                    pageSize={8}
                                    onChange={(page, pageSize) => setPagination({ ...pagination, current: page, pageSize: pageSize })}
                                />
                            </Col>
                        ) : (
                            <Col span={24}>
                                <p className="text-center text-gray-600">Không có bác sĩ nào</p>
                            </Col>
                        )}
                    </Row>
                }
            </div>
        </div>
    );
};

export default AllDoctor;
