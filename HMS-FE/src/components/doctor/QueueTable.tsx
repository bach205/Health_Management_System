import { useQueueStore } from "../../store/queueStore";
import { useEffect, useState } from "react";
import { getClinicService } from "../../services/clinic.service";
import { message, Select, Table, Dropdown, Menu, Button, Card, Space, Pagination } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import useQueue from "../../hooks/useQueue";
import { getQueueStatus } from "../../types/queue.type";
import ExaminationOrderModal from "./ExaminationOrderModal";
import ResultExaminationModal from "./ResultExaminationModal";
import ExaminationRecordModal from "../../components/doctor/ExaminationRecordModal";
import { useAuthStore } from "../../store/authStore";
import { updateQueueStatus } from "../../services/queue.service";
import { useSocket } from "../../hooks/useSocket";

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
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const { fetchQueue } = useQueue();
  const { user } = useAuthStore();
  const currentDoctorId = user?.id;

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await getClinicService();
        const clinicsData = res.data?.metadata.clinics || [];
        setClinics(clinicsData);
        if (clinicsData.length > 0) {
          setSelectedClinic(clinicsData[0].id.toString());
        }
      } catch (error: any) {
        message.error(
          error?.response?.data?.message || "Lỗi khi lấy danh sách phòng khám"
        );
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchQueue(selectedClinic);
    } else {
      reset();
    }
  }, [selectedClinic]);

  useSocket(
    `clinic_${selectedClinic}`,
    "queue:assigned",
    (data: { clinicId: string | number }) => {
      if (data.clinicId?.toString() === selectedClinic.toString()) {
        fetchQueue(selectedClinic);
      }
    }
  );

  const handleMenuClick = async (key: string, queue: any) => {
    if (key === "start") {
      await updateQueueStatus(queue.id.toString(), "in_progress");
    } else if (key === "skip") {
      await updateQueueStatus(queue.id.toString(), "skipped");
    } else if (key === "finish") {
      setSelectedPatient(queue.patient);
      setShowRecordModal(true);
      return;
    } else if (key === "assign") {
      setSelectedPatient(queue.patient);
      setShowResultModal(true);
      return;
    }
    fetchQueue(selectedClinic);
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
            { key: "finish", label: "Khám xong" },
            { key: "assign", label: "Chỉ định phòng tiếp" }
          );
        }

        return (
          <>
            {menuItems.map((item) => (
              <Button className="mr-2" key={item.key} onClick={() => handleMenuClick(item.key, queue)}>
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
      <Space className="mb-3">
        <span className="font-semibold">Phòng khám:</span>
        <Select
          style={{ minWidth: 200 }}
          value={selectedClinic}
          onChange={(val) => setSelectedClinic(val)}
          options={
            clinics.map((clinic: any) => ({
              label: clinic.name,
              value: clinic.id.toString(),
            }))
          }
          placeholder="Chọn phòng khám"
        />
      </Space>

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
      {/* Keep Modal as is */}
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
    </Card>
  );
};

export default QueueTable;
