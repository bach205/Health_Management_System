import { Table, Button, Card, Space, Pagination, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
// import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import ExaminationOrderModal from "../doctor/ExaminationOrderModal";
import ResultExaminationModal from "../doctor/ResultExaminationModal";
import ExaminationRecordModal from "../doctor/ExaminationRecordModal";
import { getQueueStatus } from "../../types/queue.type";
import { useSocket } from "../../hooks/useSocket";
import { useAuthStore } from "../../store/authStore";

interface Queue {
    id: number;
    patient: {
        user: {
            full_name: string;
        }
    };
    status: 'waiting' | 'in_progress' | 'done' | 'skipped';
    priority: number;
    created_at: string;
    called_at: string | null;
}

interface Pagination {
    pageNumber: number;
    pageSize: number;
}

const QueueTable = () => {
    const [queues, setQueues] = useState<Queue[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        pageNumber: 1,
        pageSize: 10
    });
    const [totalElements, setTotalElements] = useState(0);
    const { user } = useAuthStore();
    const [clinic_id, setClinicId] = useState<number | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    const fetchQueues = async () => {
        try {
            setLoading(true);
            // Assuming the doctor's clinic_id is stored in the user object
            const clinicId = clinic_id;
            if (!clinicId) {
                message.error('No clinic assigned to doctor');
                return;
            }
            const response = await axios.get(`/api/v1/queues/${clinicId}`, {
                params: {
                    pageNumber: pagination.pageNumber,
                    pageSize: pagination.pageSize
                }
            });
            setQueues(response.data.queueClinic || []);
            setTotalElements(response.data.total || 0);
        } catch (error) {
            message.error('Failed to fetch queues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // const getDoctorClinic = async () => {
        //     const response = await axios.get(`/api/v1/clinics/doctor/${user?.id}`);
        //     setClinicId(response.data.doctor.clinic_id);
        // };
        // // fetchQueues();
        // getDoctorClinic();
    }, []);


    useEffect(() => {
        if (clinic_id) {
            fetchQueues();
        }
    }, [pagination.pageNumber, pagination.pageSize, clinic_id]);

    // Listen for socket events for the doctor's clinic
    useSocket(
        `clinic_${clinic_id}`,
        "queue:assigned",
        () => {
            fetchQueues();
        }
    );

    const handleMenuClick = async (key: string, queue: any) => {
        try {
            if (key === "start") {
                await axios.patch(`/api/v1/queues/${queue.id}/status`, {
                    status: "in_progress"
                });
            } else if (key === "skip") {
                await axios.patch(`/api/v1/queues/${queue.id}/status`, {
                    status: "skipped"
                });
            } else if (key === "finish") {
                setSelectedPatient(queue.patient);
                setShowRecordModal(true);
                return;
            }
            fetchQueues();
            message.success('Queue status updated successfully');
        } catch (error) {
            message.error('Failed to update queue status');
        }
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            render: (_: any, __: any, index: number) =>
                index + 1 + (pagination.pageNumber - 1) * pagination.pageSize,
            width: 60,
        },
        {
            title: "Bệnh nhân",
            dataIndex: ["patient"],
            render: (_: any, record: any) => {
                return (
                    <div>
                        <p>{record.patient.user.full_name}</p>
                    </div>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status: string) => getQueueStatus(status),
        },
        {
            title: "Thao tác",
            dataIndex: "actions",
            render: (_: any, queue: any) => {
                const menuItems = [];

                if (queue.status === "waiting") {
                    menuItems.push(
                        { key: "start", label: "Bắt đầu khám" },
                        { key: "skip", label: "Bỏ qua" }
                    );
                }
                if (queue.status === "in_progress") {
                    menuItems.push(
                        { key: "finish", label: "Khám xong" }
                    );
                }

                return (
                    <>
                        {menuItems.map((item) => (
                            <Button
                                className="mr-2"
                                key={item.key}
                                onClick={() => handleMenuClick(item.key, queue)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </>
                );
            },
        },
    ];

    return (
        <Card className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
                <Table
                    dataSource={queues}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    bordered
                />
            </div>
            {queues && queues?.length > 0 && (
                <div className="mt-3 flex justify-end items-center">
                    <Pagination
                        current={pagination.pageNumber}
                        total={totalElements}
                        pageSize={pagination.pageSize}
                        onChange={(page) =>
                            setPagination({ ...pagination, pageNumber: page })
                        }
                        showSizeChanger={false}
                    />
                </div>
            )}

            <ExaminationRecordModal
                open={showRecordModal}
                onClose={() => setShowRecordModal(false)}
                patientId={selectedPatient?.id}
                doctorId={Number(user?.id)}
                onSuccess={() => {
                    setShowRecordModal(false);
                    setSelectedPatient(null);
                    fetchQueues();
                }}
            />
            <ResultExaminationModal
                open={showResultModal}
                onClose={() => setShowResultModal(false)}
                patientId={selectedPatient?.id}
                clinicId={Number(clinic_id)}
                doctorId={Number(user?.id)}
                currentUserId={Number(user?.id)}
                onSuccess={() => {
                    setShowResultModal(false);
                    setSelectedPatient(null);
                    fetchQueues();
                }}
            />
        </Card>
    );
};

export default QueueTable; 