import React, { use, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    Typography,
    Spin,
    Row,
    Col,
    Divider,
    Tag,
    Descriptions,
    Table,
    notification,
    Button,
    Tooltip,
    Flex
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ExaminationPDF from "../../components/pdf/ExaminationPDF";
import { ChevronLeft, Download } from "lucide-react";
import { getAppointmentRecordByAppointmentId } from "../../services/examinationRecord.service";

const { Title, Text } = Typography;

const ExaminationResult = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState<any>({
        clinic: {},
        doctor: {},
        prescriptionItems: [],
        examined_at: "",
        result: "",
        note: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const res = await getAppointmentRecordByAppointmentId(Number(appointmentId) || 0);
                console.log(res)
                setRecord(res.data.metadata);
            } catch (err: any) {
                notification.error({ message: "Không thể tải kết quả khám", description: err.message });
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [appointmentId]);

    const renderPrescriptionTable = () => {
        const columns = [
            { title: "Tên thuốc", dataIndex: "medicine_name", key: "medicine_name" },
            { title: "Liều lượng", dataIndex: "dosage", key: "dosage" },
            { title: "Tần suất", dataIndex: "frequency", key: "frequency" },
            { title: "Ghi chú", dataIndex: "note", key: "note" },
        ];

        const data = record.prescriptionItems?.map((item: any, index: number) => ({
            key: index,
            medicine_name: item.medicine?.name || "Không rõ",
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            note: item.note,
        })) || [];

        return <Table columns={columns} dataSource={data} pagination={false} />;
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
                <Spin />
            </div>
        );
    }

    if (!record) {
        return <Text type="danger">Không tìm thấy kết quả khám</Text>;
    }
    return (
        <>
            <p className="pb-3 mt-12 font-medium text-zinc-700 border-b border-zinc-300 text-center md:text-start">
                Kết quả khám bệnh
            </p>
            <div className="my-2">
                <Tooltip title="Quay lại" >
                    <Button onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-4 h-4"></ChevronLeft>
                    </Button>
                </Tooltip>
            </div>
            <Card style={{ maxWidth: 900, margin: "0 auto" }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
                    <Title level={3} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
                        Kết quả khám bệnh
                    </Title>
                    <div className="" >

                        <PDFDownloadLink
                            document={
                                <ExaminationPDF record={record} />
                            }
                            fileName={`ket-qua-kham-${appointmentId}.pdf`}
                        >
                            {({ loading }) => (
                                <Button type="primary" icon={<Download className="w-4 h-4" />} loading={loading}>
                                    Xuất PDF
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </Flex>


                <Descriptions bordered column={1} style={{ marginTop: 20 }}>
                    <Descriptions.Item label="Tại phòng khám">{record.clinic?.name || "Chưa rõ"}</Descriptions.Item>
                    <Descriptions.Item label="Bác sĩ">{record.doctor?.user?.full_name || "Chưa rõ"}</Descriptions.Item>
                    <Descriptions.Item label="Ngày khám">{dayjs(record.examined_at).format("HH:mm DD/MM/YYYY")}</Descriptions.Item>
                    <Descriptions.Item label="Kết quả khám">
                        <div style={{ whiteSpace: "pre-line" }}>{record.result}</div>
                    </Descriptions.Item>
                    {record.note && (
                        <Descriptions.Item label="Ghi chú thêm">
                            <div style={{ whiteSpace: "pre-line" }}>{record.note}</div>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {record.prescriptionItems?.length > 0 && (
                    <>
                        <Divider />
                        <Title level={4}>Đơn thuốc</Title>
                        {renderPrescriptionTable()}
                    </>
                )}
                <div style={{ maxWidth: 900, margin: "0 auto" }} >

                </div>
            </Card>
        </>
    );
};

export default ExaminationResult;
