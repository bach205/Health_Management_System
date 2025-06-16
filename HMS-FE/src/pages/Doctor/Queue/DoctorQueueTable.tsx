import { useEffect, useState } from "react";
import { useQueueStore } from "../../../store/queueStore";
import { getClinicService } from "../../../services/clinic.service";
import { toast } from "react-toastify";
import useQueue from "../../../hooks/useQueue";
import { getQueueStatus } from "../../../types/queue.type";
import ExaminationOrderModal from "../../../components/doctor/ExaminationOrderModal";
import ResultExaminationModal from "../../../components/doctor/ResultExaminationModal";
import ExaminationRecordModal from "../../../components/doctor/ExaminationRecordModal";
import { useAuthStore } from "../../../store/authStore";
import { useSocket } from "../../../hooks/useSocket";
import { updateQueueStatus } from "../../../services/queue.service";
import { Dropdown, Menu, Select, Table, Typography } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

const QueueTable = () => {
    const {
        queues,
        pagination,
        totalElements,
        setPagination,
        totalPages,
        reset,
        setQueues,  // Thêm setQueues vào đây
    } = useQueueStore();

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
    // useSocket(
    //     `clinic_${selectedClinic}`,
    //     "queue:statusChanged",
    //     (data: any) => {
    //         if (data.clinicId?.toString() === selectedClinic.toString()) {
    //             fetchQueue(selectedClinic);
    //         }
    //     }
    // );

    // // Cập nhật xử lý socket cho queue:assigned
    // useSocket(
    //     `clinic_${selectedClinic}`,
    //     "queue:assigned",
    //     (data: any) => {
    //         if (data.clinicId?.toString() === selectedClinic.toString()) {
    //             fetchQueue(selectedClinic);
    //         }
    //     }
    // );

    // // Thêm socket cho queue:missed nếu cần
    // useSocket(
    //     `clinic_${selectedClinic}`,
    //     "queue:missed",
    //     (data: any) => {
    //         if (data.clinicId?.toString() === selectedClinic.toString()) {
    //             fetchQueue(selectedClinic);
    //         }
    //     }
    // );
    const handleStatusUpdate = async (queueId: string, newStatus: string) => {
        try {
            await updateQueueStatus(queueId, newStatus);
            // Không cần fetchQueue nữa vì socket sẽ handle việc update UI
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    };
    // Cập nhật Menu.Item để sử dụng handleStatusUpdate
    const menu = (record: any) => (
        <Menu>
            {record.status === "waiting" && (
                <>
                    <Menu.Item
                        key="start"
                        onClick={() => handleStatusUpdate(record.id, "in_progress")}
                    >
                        Bắt đầu khám
                    </Menu.Item>
                    <Menu.Item
                        key="skip"
                        onClick={() => handleStatusUpdate(record.id, "skipped")}
                    >
                        Bỏ qua
                    </Menu.Item>
                </>
            )}
            {/* Rest of the menu items... */}
        </Menu>
    );
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

    const handleFinishExam = (patient: any) => {
        setSelectedPatient(patient);
        setShowRecordModal(true);
    };

    const handleAssignClinic = (patient: any) => {
        setSelectedPatient(patient);
        setShowResultModal(true);
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            render: (_: any, __: any, index: number) =>
                index + 1 + (pagination.pageNumber - 1) * pagination.pageSize,
        },
        {
            title: "Bệnh nhân",
            dataIndex: ["patient", "user", "full_name"],
            key: "full_name",
            render: (_: any, record: any) => record?.patient?.user?.full_name || "-",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => <Text>{getQueueStatus(status)}</Text>,
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => {
                const menu = (
                    <Menu>
                        {record.status === "waiting" && (
                            <>
                                <Menu.Item
                                    key="start"
                                    onClick={() => handleStatusUpdate(record.id, "in_progress")}
                                >
                                    Bắt đầu khám
                                </Menu.Item>
                                <Menu.Item
                                    key="skip"
                                    onClick={() => handleStatusUpdate(record.id, "skipped")}
                                >
                                    Bỏ qua
                                </Menu.Item>
                            </>
                        )}
                        {record.status === "in_progress" && (
                            <>
                                <Menu.Item key="finish" onClick={() => handleFinishExam(record.patient)}>
                                    Khám xong
                                </Menu.Item>
                                <Menu.Item key="assign" onClick={() => handleAssignClinic(record.patient)}>
                                    Chỉ định phòng tiếp
                                </Menu.Item>
                            </>
                        )}
                    </Menu>
                );
                return (
                    <Dropdown overlay={menu} trigger={["click"]}>
                        <EllipsisOutlined style={{ fontSize: 18, cursor: "pointer" }} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div className="flex flex-col w-full h-full p-4 gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="clinic-select" className="font-semibold">
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
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={queues}
                pagination={{
                    current: pagination.pageNumber,
                    pageSize: pagination.pageSize,
                    total: totalElements,
                    onChange: (page) =>
                        setPagination({
                            ...pagination,
                            pageNumber: page,
                        }),
                }}
                scroll={{ y: 400 }}
            />

            <ExaminationOrderModal
                open={showAssignModal && !!selectedPatient}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedPatient(null);
                }}
                patient={selectedPatient}
                clinics={clinics}
                selectedClinicId={selectedClinic}
                onSuccess={() => {
                    setShowAssignModal(false);
                    setSelectedPatient(null);
                    fetchQueue(selectedClinic);
                }}
            />
            <ExaminationRecordModal
                open={showRecordModal}
                onClose={() => setShowRecordModal(false)}
                patientId={selectedPatient?.id}
                doctorId={Number(currentDoctorId)}
                onSuccess={() => {
                    setShowRecordModal(false);
                    setSelectedPatient(null);
                    fetchQueue(selectedClinic);
                }}
            />
            <ResultExaminationModal
                open={showResultModal}
                onClose={() => setShowResultModal(false)}
                patientId={selectedPatient?.id}
                clinicId={Number(selectedClinic)}
                doctorId={Number(currentDoctorId)}
                currentUserId={Number(user?.id)}
                onSuccess={() => {
                    setShowResultModal(false);
                    setSelectedPatient(null);
                    fetchQueue(selectedClinic);
                }}
            />
        </div>
    );
};

export default QueueTable;
