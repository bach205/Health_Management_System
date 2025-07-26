import { Button, Modal, Table, Descriptions, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { getPatientExaminationHistory } from "../../../services/examinationRecord.service";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const ModalPatientExaminationHistory = ({ open, onClose, patient }: { open: boolean, onClose: () => void, patient: any }) => {
    const [examinationHistory, setExaminationHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && patient) {
            const fetchExaminationHistory = async () => {
                setLoading(true);
                try {
                    const res = await getPatientExaminationHistory(patient.id);
                    setExaminationHistory(res.data.metadata || []);
                } catch (error: any) {
                    console.error("Error fetching examination history:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchExaminationHistory();
        }
    }, [open, patient]);

    const columns = [
        {
            title: "Ngày Đặt Lịch",
            dataIndex: "examined_at",
            key: "examined_at",
            width: 120,
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Giờ khám",
            dataIndex: "examined_at",
            key: "examined_at_time",
            width: 80,
            render: (date: string) => dayjs(date).format("HH:mm"),
        },
        {
            title: "Bác sĩ",
            dataIndex: ["doctor", "user", "full_name"],
            key: "doctor",
            width: 150,
        },
        {
            title: "Phòng khám",
            dataIndex: ["clinic", "name"],
            key: "clinic",
            width: 150,
        },
        {
            title: "Kết quả",
            dataIndex: "result",
            key: "result",
            ellipsis: true,
            render: (result: string) => (
                <Text ellipsis={{ tooltip: result }}>
                    {result || "Chưa có kết quả"}
                </Text>
            ),
        },
        {
            title: "Đơn thuốc",
            dataIndex: "prescriptionItems",
            key: "prescription",
            width: 100,
            render: (prescriptionItems: any[]) => (
                <Tag color={prescriptionItems?.length > 0 ? "green" : "default"}>
                    {prescriptionItems?.length || 0} loại
                </Tag>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div>
                    <Title level={4} style={{ margin: 0 }}>
                        Lịch sử khám bệnh
                    </Title>
                    <Text type="secondary">
                        Bệnh nhân: {patient?.user?.full_name}
                    </Text>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>
            ]}
            width={1000}
            destroyOnClose
        >
            {examinationHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Text type="secondary">Chưa có lịch sử khám</Text>
                </div>
            ) : (
                <Table
                    dataSource={examinationHistory}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                    }}
                    rowKey="id"
                    size="small"
                />
            )}
        </Modal>
    );
};

export default ModalPatientExaminationHistory; 