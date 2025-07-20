import { useEffect, useState } from "react";
import { useQueueStore } from "../../../store/queueStore";
import { getClinicService } from "../../../services/clinic.service";
import { toast } from "react-toastify";
import useQueue from "../../../hooks/useQueue";
import { getQueueStatus } from "../../../types/queue.type";
import { useAuthStore } from "../../../store/authStore";
import { useSocket } from "../../../hooks/socket/useSocket";
import { updateQueueStatus } from "../../../services/queue.service";
import { Button, Dropdown, Flex, Menu, message, notification, Select, Space, Table, Tag, Tooltip, Typography, Modal, DatePicker } from "antd";
import ModalPatientExaminationOrder from "./ModalPatientExaminationOrder";
import DoctorExaminationOrderModal from "./DoctorExaminationOrderModal";
import { ArrowBigRight, ClipboardCheck, FileClock, LogOut, RefreshCcw, Stethoscope } from "lucide-react";
import dayjs from "dayjs";
import DoctorExaminationRecordModal from "./DoctorExaminationRecord";

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
    console.log(queues);
    const [showModalPatientExaminationOrder, setShowModalPatientExaminationOrder] = useState(false);
    const [showDoctorExaminationOrderModal, setShowDoctorExaminationOrderModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState("");
    const [selectedAppointment, SetSelectedAppointment] = useState(null)
    const { fetchQueue } = useQueue();
    const { user } = useAuthStore();
    const currentDoctorId = user?.id;
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);


    const [statusFilter, setStatusFilter] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Lọc queues theo ngày khám
    const filteredQueues = (() => {
        if (selectedDate) {
            return queues.filter((q: any) =>
                dayjs.utc(q.appointment?.appointment_date).format("YYYY-MM-DD") === selectedDate
            );
        } else {
            // Nếu không chọn ngày, lấy ngày khám gần nhất hiện tại (>= hôm nay)
            const today = dayjs().startOf('day');
            // Lấy các ngày khám >= hôm nay
            const futureDates = Array.from(new Set(
                queues
                    .filter((q: any) => dayjs.utc(q.appointment?.appointment_date).isSameOrAfter(today))
                    .map((q: any) => dayjs.utc(q.appointment?.appointment_date).format("YYYY-MM-DD"))
            ));
            // Sắp xếp tăng dần
            futureDates.sort();
            const nearestDate = futureDates[0];
            if (nearestDate) {
                return queues.filter((q: any) =>
                    dayjs.utc(q.appointment?.appointment_date).format("YYYY-MM-DD") === nearestDate
                );
            }
            // Nếu không có ngày >= hôm nay, trả về tất cả queues
            return queues;
        }
    })();

    // // Cập nhật xử lý socket cho queue:statusChanged
    useSocket(
        `clinic_${selectedClinic}`,
        "queue:statusChanged",
        (data: any) => {
            if (data.clinicId?.toString() === selectedClinic.toString()) {
                fetchQueue(selectedClinic, undefined, statusFilter);
            }
        }
    );

    // Cập nhật xử lý socket cho queue:assigned
    useSocket(
        `clinic_${selectedClinic}`,
        "queue:assigned",
        (data: any) => {
            if (data.clinicId?.toString() === selectedClinic.toString()) {
                fetchQueue(selectedClinic, undefined, statusFilter);
            }
        }
    );

    // Thêm socket cho queue:missed nếu cần
    useSocket(
        `clinic_${selectedClinic}`,
        "queue:missed",
        (data: any) => {
            if (data.clinicId?.toString() === selectedClinic.toString()) {
                fetchQueue(selectedClinic, undefined, statusFilter);
            }
        }
    );
    const handleStatusUpdate = async (queueId: string, newStatus: string) => {
        const queue: any = queues.find((queue: any) => queue.id === queueId);
        console.log(queue)
        console.log(" appointmentTime", dayjs.utc(queue.appointment.appointment_time).hour(), "now", dayjs().hour())
        console.log("not time", dayjs.utc(queue.appointment.appointment_time).hour() > dayjs().hour())
        console.log(" time", dayjs.utc(queue.appointment.appointment_date), "now", dayjs())

        if (queue) {
            const appointmentTime = dayjs.utc(queue.appointment.appointment_time);
            const appointmentDate = dayjs.utc(queue.appointment.appointment_date);

            // Kiểm tra xem giờ khám, ngày khám có đã qua hay không
            if (appointmentDate > dayjs() && appointmentTime.hour() > dayjs().hour() && appointmentTime.minute() > dayjs().minute()) {
                message.error("Chưa đến giờ khám");
                return;
            }
        }
        try {
            await updateQueueStatus(queueId, newStatus);
            // Không cần fetchQueue nữa vì socket sẽ handle việc update UI
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        }
    };

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

    const handleFinishExam = (record: any) => {
        console.log("handleFinishExam", record);
        setSelectedAppointmentId(record.appointment_id);
        setSelectedPatient(record.patient);
        setShowRecordModal(true);
        console.log("selectedAppointmentId, selectedPatient", selectedAppointmentId, selectedPatient);
    };
    const handleAssignClinic = (record: any) => {
        setSelectedPatient(record.patient);
        setSelectedAppointmentId(record.appointment_id);
        setShowDoctorExaminationOrderModal(true);
        // setShowResultModal(true);
        console.log("handleAssignClinic", record);
        console.log("selectedAppointmentId, selectedPatient", selectedAppointmentId, selectedPatient);
    };

    const handleViewExaminationOrder = (patient: any) => {
        setSelectedPatient(patient);
        setShowModalPatientExaminationOrder(true);
    };

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
            dataIndex: "queue_number",
            key: "id",
            align: "center",
            width: 50,
            render: (_: any, record: any, index: number) =>
                <p className="text-primary font-bold">{record.queue_number}</p>
            ,
        },
        {
            title: "Bệnh nhân",
            dataIndex: ["patient", "user", "full_name"],
            key: "full_name",
            width: 150,
            render: (_: any, record: any) => record?.patient?.user?.full_name || "-",
        },
        {
            title: "Bác sĩ khám",
            dataIndex: ["appointment", "doctor", "full_name"],
            key: "full_name",
            width: 150,
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
            width: 100,
            render: (status: string) => <Tag color={getQueueStatusColor(status)}>{getQueueStatus(status)}</Tag>,
        },
        {
            title: "Thao tác",
            key: "action",
            fixed: "right",
            ellipsis: true,
            width: 250,
            render: (_: any, record: any) => {
                console.log(record);
                return (
                    <Space wrap size={'small'}>
                        {record.status === "waiting" && (
                            <>
                                <Tooltip title="Bắt đầu khám">
                                    <Button
                                        key="start"
                                        onClick={() => handleStatusUpdate(record.id, "in_progress")}
                                        type="primary"
                                    >
                                        <Stethoscope className="w-4 h-4" /> Bắt đầu
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Bỏ qua bệnh nhân">
                                    <Button
                                        key="skip"
                                        onClick={() => handleStatusUpdate(record.id, "skipped")}
                                        danger
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                        {record.status === "in_progress" && (
                            <>
                                <Tooltip title="Hoàn thành khám">
                                    <Button
                                        type="primary"
                                        key="finish"
                                        onClick={() => handleFinishExam(record)}
                                    >
                                        <ClipboardCheck className="w-4 h-4" /> Khám xong
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Xem lịch sử chuyển phòng">
                                    <Button
                                        key="viewExaminationOrder"
                                        onClick={() => handleViewExaminationOrder(record.patient)}
                                    >
                                        <FileClock className="w-4 h-4" />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Chỉ định đến phòng tiếp theo">
                                    <Button
                                        type="dashed"
                                        key="assign"
                                        onClick={() => handleAssignClinic(record)}
                                    >
                                        <ArrowBigRight className="w-5 h-5" />
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                    </Space>
                );
            }
        },
    ];


    const handleFilter = (value: string) => {
        setStatusFilter(value);

        fetchQueue(selectedClinic, undefined, value);
    }

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
                        onChange={(value) => {
                            setStatusFilter("");
                            setSelectedClinic(value)
                        }}
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
                    {/* Filter ngày khám */}
                    <DatePicker
                        allowClear
                        placeholder="Lọc theo ngày khám"
                        format="YYYY-MM-DD"
                        value={selectedDate ? dayjs(selectedDate) : null}
                        onChange={d => setSelectedDate(d ? d.format("YYYY-MM-DD") : null)}
                        style={{ minWidth: 160 }}
                        disabled={queues.length === 0}
                    />
                </Flex>
                {
                    selectedClinic && (
                        <>
                            <Tooltip title="Làm mới">
                                <Button onClick={() => fetchQueue(selectedClinic, undefined, statusFilter)}>
                                    <RefreshCcw size={17.5} />
                                </Button>
                            </Tooltip>
                            <Space size={'small'}>
                                <label htmlFor="clinic-select" className="font-light">
                                    Lọc theo:
                                </label>
                                <Select style={{ minWidth: 200 }} value={statusFilter} onChange={handleFilter} placeholder="Chọn trạng thái">
                                    <Option key={"clinic.id"} value={""}>
                                        Chờ khám và đang khám
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
                dataSource={filteredQueues}
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
            {/* Xem lich su chuyen phong */}
            <ModalPatientExaminationOrder
                open={showModalPatientExaminationOrder}
                onClose={() => setShowModalPatientExaminationOrder(false)}
                patient={selectedPatient}
            />
            {/* viet lenh chuyen phong */}
            <DoctorExaminationOrderModal
                open={showDoctorExaminationOrderModal}
                onClose={() => setShowDoctorExaminationOrderModal(false)}
                patient_id={selectedPatient?.id}
                appointment_id={selectedAppointmentId ?? 0}

                clinic_id={Number(selectedClinic)}
                doctor_id={(Number)(currentDoctorId)}
                currentUserId={(Number)(user?.id)}
                onSuccess={() => {
                    setShowDoctorExaminationOrderModal(false);
                    setSelectedPatient(null);
                    fetchQueue(selectedClinic);
                }}
            />
            {/* viet ket qua kham + don thuoc */}
            <DoctorExaminationRecordModal
                open={showRecordModal}
                appointment_id={Number(selectedAppointmentId)}
                onClose={() => setShowRecordModal(false)}
                patient_id={selectedPatient?.id}
                clinic_id={Number(selectedClinic)}
                doctor_id={Number(currentDoctorId)}
                onSuccess={() => {
                    setShowRecordModal(false);
                    setSelectedPatient(null);
                    fetchQueue(selectedClinic);
                }}
            />
        </div>
    );
};

export default QueueTable;
