import { useEffect, useState } from "react";
import { useQueueStore } from "../../../store/queueStore";
import { getClinicService } from "../../../services/clinic.service";
import { toast } from "react-toastify";
import useQueue from "../../../hooks/useQueue";
import { getQueueStatus } from "../../../types/queue.type";
import { useAuthStore } from "../../../store/authStore";
import { useSocket } from "../../../hooks/useSocket";
import { Button, Flex, Select, Space, Table, Tag, Tooltip, Typography } from "antd";
import { RefreshCcw } from "lucide-react";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;

const PatientQueueTable = () => {
    const {
        queues,
        pagination,
        totalElements,
        setPagination,
        totalPages,
        reset,
        setQueues,  // Thêm setQueues vào đây
    } = useQueueStore();
    console.log(queues);
    const [showModalPatientExaminationOrder, setShowModalPatientExaminationOrder] = useState(false);
    const [showDoctorExaminationOrderModal, setShowDoctorExaminationOrderModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState("");
    const { fetchQueue } = useQueue();
    const { user } = useAuthStore();
    const currentDoctorId = user?.id;

    // // Cập nhật xử lý socket cho queue:statusChanged
    useSocket(
        `clinic_${selectedClinic}`,
        "queue:statusChanged",
        (data: any) => {
            if (data.clinicId?.toString() === selectedClinic.toString()) {
                fetchQueue(selectedClinic);
            }
        }
    );

    // Cập nhật xử lý socket cho queue:assigned
    useSocket(
        `clinic_${selectedClinic}`,
        "queue:assigned",
        (data: any) => {
            if (data.clinicId?.toString() === selectedClinic.toString()) {
                fetchQueue(selectedClinic);
            }
        }
    );

    // Thêm socket cho queue:missed nếu cần
    useSocket(
        `clinic_${selectedClinic}`,
        "queue:missed",
        (data: any) => {
            if (data.clinicId?.toString() === selectedClinic.toString()) {
                fetchQueue(selectedClinic);
            }
        }
    );

    // const menu = (record: any) => (
    //     <Menu>
    //         {record.status === "waiting" && (
    //             <>
    //                 <Menu.Item
    //                     key="start"
    //                     onClick={() => handleStatusUpdate(record.id, "in_progress")}
    //                 >
    //                     Bắt đầu khám
    //                 </Menu.Item>
    //                 <Menu.Item
    //                     key="skip"
    //                     onClick={() => handleStatusUpdate(record.id, "skipped")}
    //                     danger
    //                 >
    //                     Bỏ qua
    //                 </Menu.Item>
    //             </>
    //         )}
    //         {/* Rest of the menu items... */}
    //     </Menu>
    // );
    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const res = await getClinicService();
                const fetchedClinics = res.data?.metadata.clinics || [];
                setClinics(fetchedClinics);
                // if (fetchedClinics.length > 0) {
                //   setSelectedClinic(fetchedClinics[0].id.toString());
                // }
            } catch (error: any) {
                toast.error(
                    error?.response?.data?.message || "Lỗi khi lấy danh sách phòng khám"
                );
            }
        };
        fetchClinics();
    }, []);

    useEffect(() => {
        if (selectedClinic) fetchQueue(selectedClinic);
        else reset();
    }, [selectedClinic]);


    const getQueueStatusColor = (status: string) => {
        switch (status) {
            case "waiting":
                return "yellow";
            case "in_progress":
                return "blue";
            case "done":
                return "green";
            case "skipped":
                return "red";
            default:
                return "default";
        }
    };

    const columns: any = [
        {
            title: "STT",
            dataIndex: "id",
            key: "id",
            align: "center",
            width: 50,
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: "Bệnh nhân",
            dataIndex: ["patient", "user", "full_name"],
            key: "full_name",
            width: 200,
            render: (_: any, record: any) => record?.patient?.user?.full_name || "-",
        },
        {
            title: "Bác sĩ khám",
            dataIndex: ["appointment", "doctor", "full_name"],
            key: "full_name",
            width: 200,
            render: (_: any, record: any) => record?.appointment?.doctor?.full_name || "-",
        },
        {
            title: "Giờ khám",
            dataIndex: ["appointment"],
            key: "appointment",
            width: 100,
            render: (appointment: any) => <Tag>{dayjs.utc(appointment?.appointment_time).format("HH:mm")}</Tag>,
        },

        {
            title: "Ngày khám",
            dataIndex: ["appointment"],
            key: "appointment",
            width: 100,
            render: (appointment: any) => <Tag>{dayjs.utc(appointment?.appointment_date).format("DD/MM/YYYY")}</Tag>,
        },

        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status: string) => <Tag color={getQueueStatusColor(status)}>{getQueueStatus(status)}</Tag>,
        },
    ];

    return (
        <div className="flex flex-col w-full h-full p-4 gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <Flex gap={10} align="center">
                    <label htmlFor="clinic-select" className="font-semibold ">
                        Phòng khám:
                    </label>
                    <Select
                        id="clinic-select"
                        value={selectedClinic}
                        onChange={(value) => setSelectedClinic(value)}
                        style={{ minWidth: 200 }}
                    >
                        <Option key={"clinic.id"} value={""}>
                            Chọn phòng khám
                        </Option>

                        {clinics.map((clinic) => (
                            <Option key={clinic.id} value={clinic.id.toString()}>
                                {clinic.name}
                            </Option>
                        ))}
                    </Select>
                </Flex>
                {
                    selectedClinic && (
                        <>
                            <Tooltip title="Làm mới">
                                <Button onClick={() => fetchQueue(selectedClinic)}>
                                    <RefreshCcw size={17.5} />
                                </Button>
                            </Tooltip>
                            <Space size={'small'}>
                                <label htmlFor="clinic-select" className="font-light">
                                    Lọc theo:
                                </label>
                                <Select style={{ minWidth: 200 }} value={""} >
                                    <Option key={"clinic.id"} value={""}>
                                        Tất cả
                                    </Option>

                                    <Option value={"waiting"}>Chờ khám</Option>
                                    <Option value={"in_progress"}>Đang khám</Option>
                                    <Option value={"done"}>Đã khám</Option>
                                    <Option value={"skipped"}>Bỏ qua</Option>
                                </Select>
                            </Space>
                        </>
                    )
                }

            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={queues}
                pagination={{
                    current: pagination.pageNumber,
                    pageSize: pagination.pageSize,
                    total: totalElements,
                    onChange: (page, pageSize) => {
                        setPagination({
                            pageNumber: page,
                            pageSize,
                        });
                        fetchQueue(selectedClinic, { pageNumber: page, pageSize });
                    },
                }}
                size="middle"
                scroll={{ y: 400 }}
            />
 
        </div>
    );
};

export default PatientQueueTable;
