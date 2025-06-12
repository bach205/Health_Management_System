import { useQueueStore } from "../../store/queueStore";
import { useEffect, useState, useRef } from "react";
import { getClinicService } from "../../services/clinic.service";
import { toast } from "react-toastify";
import useQueue from "../../hooks/useQueue";
import { getQueueStatus } from "../../types/queue.type";
import ExaminationOrderModal from "./ExaminationOrderModal";
import { updateQueueStatus } from "../../services/queue.service";
import { Ellipsis } from "lucide-react";
import ResultExaminationModal from "./ResultExaminationModal";
import ExaminationRecordModal from "../../components/doctor/ExaminationRecordModal";
import { useAuthStore } from "../../store/authStore";
import {
  Card,
  Select,
  Table,
  Tag,
  Button,
  Dropdown,
  Space,
  Badge,
  Typography,
  Tooltip,
  Statistic
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  ArrowRightOutlined,
  MoreOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");

const { Title, Text } = Typography;
const { Option } = Select;

const QueueTable = () => {
  const {
    queues,
    pagination,
    totalElements,
    setPagination,
    totalPages,
    reset,
  } = useQueueStore();
  const [showResultModal, setShowResultModal] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const { fetchQueue } = useQueue();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const { user } = useAuthStore();
  const currentDoctorId = user?.id;

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const res = await getClinicService();
      setClinics(res.data?.metadata.clinics || []);
      if (res.data?.metadata && res.data?.metadata.length > 0) {
        setSelectedClinic(res.data?.metadata[0].id.toString());
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Lỗi khi lấy danh sách phòng khám"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClinic) {
      fetchQueue(selectedClinic);
    } else {
      reset();
    }
  }, [selectedClinic]);

  const handleFinishExam = (patient: any) => {
    setSelectedPatient(patient);
    setShowRecordModal(true);
  };

  const handleAssignClinic = (patient: any) => {
    setSelectedPatient(patient);
    setShowResultModal(true);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      waiting: { color: "gold", text: "Đang chờ" },
      in_progress: { color: "processing", text: "Đang khám" },
      completed: { color: "success", text: "Hoàn thành" },
      cancelled: { color: "error", text: "Đã hủy" }
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority: number) => {
    const priorityConfig: Record<number, { color: string; text: string }> = {
      0: { color: "default", text: "Thường" },
      1: { color: "warning", text: "Ưu tiên" },
      2: { color: "error", text: "Khẩn cấp" }
    };
    const config = priorityConfig[priority];
    return <Tag color={config?.color || "default"}>{config?.text || "Thường"}</Tag>;
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      render: (_: any, __: any, index: number) => (
        <Text>{(pagination.pageNumber - 1) * pagination.pageSize + index + 1}</Text>
      ),
    },
    {
      title: "Thông tin bệnh nhân",
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.patient.fullname}</Text>
          <Space size="large">
            <Text type="secondary">
              <UserOutlined /> {record.patient.gender === "male" ? "Nam" : "Nữ"}
            </Text>
            <Text type="secondary">{record.patient.phone}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Thời gian chờ",
      width: 150,
      render: (record: any) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
        </Space>
      ),
    },
    {
      title: "Mức độ ưu tiên",
      width: 120,
      render: (record: any) => getPriorityTag(record.priority),
      sorter: (a: any, b: any) => b.priority - a.priority,
    },
    {
      title: "Trạng thái",
      width: 130,
      render: (record: any) => getStatusTag(record.status),
    },
    {
      title: "Thao tác",
      width: 150,
      render: (record: any) => (
        <Space>
          {record.status === "waiting" && (
            <Button 
              type="primary"
              icon={<MedicineBoxOutlined />}
              onClick={() => handleFinishExam(record.patient)}
            >
              Bắt đầu khám
            </Button>
          )}
          {record.status === "in_progress" && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "finish",
                    label: "Kết thúc khám",
                    onClick: () => handleFinishExam(record.patient),
                  },
                  {
                    key: "assign",
                    label: "Chỉ định phòng tiếp",
                    onClick: () => handleAssignClinic(record.patient),
                  },
                ],
              }}
            >
              <Button icon={<MoreOutlined />}>Thao tác</Button>
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  const getCurrentClinicStats = () => {
    const currentClinic = clinics.find(c => c.id.toString() === selectedClinic);
    if (!currentClinic) return null;

    const waitingCount = queues.filter(q => q.status === "waiting").length;
    const inProgressCount = queues.filter(q => q.status === "in_progress").length;

    return {
      name: currentClinic.name,
      waitingCount,
      inProgressCount,
      volume: currentClinic.patient_volume
    };
  };

  const clinicStats = getCurrentClinicStats();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Space direction="vertical" size="small">
            <Title level={4} style={{ margin: 0 }}>Hàng chờ phòng khám</Title>
            <Space size="large">
              <Select
                value={selectedClinic}
                onChange={setSelectedClinic}
                style={{ width: 200 }}
                loading={loading}
              >
                <Option value="">Chọn phòng khám</Option>
                {clinics.map((clinic: any) => (
                  <Option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </Option>
                ))}
              </Select>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchQueue(selectedClinic)}
              >
                Làm mới
              </Button>
            </Space>
          </Space>
          
          {clinicStats && (
            <Space size="large">
              <Statistic
                title="Đang chờ"
                value={clinicStats.waitingCount}
                prefix={<Badge status="warning" />}
              />
              <Statistic
                title="Đang khám"
                value={clinicStats.inProgressCount}
                prefix={<Badge status="processing" />}
              />
              <Tooltip title="Mức độ bận">
                <Tag color={
                  clinicStats.volume === "high" ? "red" :
                  clinicStats.volume === "medium" ? "orange" : "green"
                }>
                  {clinicStats.volume === "high" ? "Đông" :
                   clinicStats.volume === "medium" ? "Trung bình" : "Vắng"}
                </Tag>
              </Tooltip>
            </Space>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={queues}
          rowKey="id"
          pagination={{
            current: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total: totalElements,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bệnh nhân`,
          }}
          onChange={(pagination) => {
            setPagination({
              pageNumber: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            });
          }}
          loading={loading}
        />
      </Card>

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
    </div>
  );
};

export default QueueTable;
