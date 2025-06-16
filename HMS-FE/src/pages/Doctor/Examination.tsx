import { useState } from "react";
import ExaminationModal from "./ExaminationModal";
import { Button, Descriptions, Flex, Form, Space, Table, Tag, Tooltip, Typography } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { ArrowLeft, CheckCircle, Edit } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import TransferRoomModal from "./TransferRoomModal";
import EditExaminationModal from "./EditExaminationModal";

const Examination = () => {
    const [isExaminationModalVisible, setIsExaminationModalVisible] = useState(false);
    const [isTransferRoomVisible, setIsTransferRoomVisible] = useState(false);
    const [isEditExaminationModalVisible, setIsEditExaminationModalVisible] = useState(false);
    const [examinationForm] = Form.useForm();
    const [transferRoomForm] = Form.useForm();
    const [isExamined, setIsExamined] = useState(false);
    const [editExaminationForm] = Form.useForm();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const navigate = useNavigate();


    const handleExaminationOk = () => {
        setIsExaminationModalVisible(false);
        setIsExamined(true);
    }
    const handleExaminationCancel = () => {
        setIsExaminationModalVisible(false);
    }
    const handleTransferRoomOk = () => {
        setIsTransferRoomVisible(false);
    }
    const handleTransferRoomCancel = () => {
        setIsTransferRoomVisible(false);
    }
    const handleEditExaminationOk = () => {
        setIsEditExaminationModalVisible(false);
    }
    const handleEditExaminationCancel = () => {
        setIsEditExaminationModalVisible(false);
    }

    const roomColumns = [   
        {
            title: "Ngày khám",
            dataIndex: "createdAt",
            key: "createdAt",
        },
        {
            title: "Bác sĩ",
            dataIndex: "doctorId",
            key: "doctorId",
        },
        {
            title: "Phòng",
            dataIndex: "clinicId",
            key: "clinicId",
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
        },
    ]

    const examinationColumns = [
        {
            title: "Ngày khám",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 160,
            render: (createdAt: any) => dayjs(createdAt).format("DD/MM/YYYY"),
        },
        {
            width: 170,
            title: "Bác sĩ",
            dataIndex: "doctorId",
            key: "doctorId",

        },
        {
            title: "Phòng",
            dataIndex: "clinicId",
            key: "clinicId",
        },
        {
            title: "Chuẩn đoán",
            dataIndex: "final_diagnosis",
            key: "final_diagnosis",
        },
        {
            title: "Triệu chứng",
            dataIndex: "symptoms",
            key: "symptoms",
        },

        {
            width: 150,
            title: "Hành động",
            key: "action",
            render: (record: any) => {
                return (record.doctorId === user.id || true) ? (
                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button icon={<Edit className="w-4 h-4" />}
                                onClick={() => setIsEditExaminationModalVisible(true)}
                            />
                        </Tooltip>
                    </Space>
                ) : null
            },
        },
    ];

    const birthdayAndAge = (date: any) => {
        return `${dayjs(date).format("DD/MM/YYYY")}- ${dayjs().diff(
            date,
            "year"
        )} tuổi`;
    };

    const formatedTime = (
        date: any,
        format = "HH:mm",
        formatTime = "HH:mm"
    ) => {
        return dayjs(date, format).format(formatTime);
    };

    const selectedAppoiment = {
        date: "2025-01-01",
        time: "10:00",
        patientId: {
            fullName: "Nguyễn Văn A",
            birthday: "1990-01-01",
            phone: "0909090909"
        }
    }
    const roomHistory = [
        {
            key: "1",
            createdAt: "2025-01-01T10:00:00Z",
            doctorId: "Bác sĩ A",
            clinicId: "Phòng A",
            note: "Amidan sưng to, có mủ, xét nghiệm liên cầu dương tính",
        }
    ]   

    const examinationHistory = [
        {
            key: "1",
            createdAt: "2025-01-01T10:00:00Z",
            doctorId: "Bác sĩ A",
            final_diagnosis: "Viêm họng cấp do liên cầu khuẩn",
            symptoms: "Sốt cao 39 độ, ho, đau họng",
            clinicId: "Phòng A",
            note: "Lưu ý cho bệnh nhân",
        },
        {
            key: "2",
            createdAt: "2025-01-02T10:00:00Z",
            doctorId: "Bác sĩ B",
            final_diagnosis: "Viêm họng cấp do liên cầu khuẩn",
            symptoms: "Sốt cao 39 độ, ho, đau họng",
            clinicId: "Phòng B",
            note: "Lưu ý cho bệnh nhân 2",
        },
    ]

    return (
        <div className="pb-5">
            <Flex gap={20}
                align="center"
                justify={'space-between'}
                style={{ marginBottom: 20 }}
            >
                <Flex gap={20} align="center">
                    <Tooltip title="Quay lại">
                        <Button icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)} />
                    </Tooltip>
                    <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 0, }} >
                        Khám bệnh
                    </Typography.Title>
                </Flex>
                <Tooltip placement="bottomLeft" title={!isExamined ? "Chưa có kết quả khám hoặc chuyển phòng" : "Khám xong"} >
                    <Button type="primary"
                        disabled={!isExamined}
                        icon={<CheckCircle className="w-4 h-4" />}
                    >
                        Khám xong
                    </Button>
                </Tooltip>
            </Flex>
            <Typography.Title
                level={3}
                style={{ marginTop: 0, marginBottom: 0 }}
            >
                Thông tin bệnh nhân
            </Typography.Title>

            <div className="bg-white rounded-lg shadow-md">
                <Title title="Thông tin bệnh nhân" />
                <Descriptions column={2} bordered>
                    <Descriptions.Item label="Bệnh nhân" style={{ fontWeight: "bold" }}>
                        {selectedAppoiment?.patientId?.fullName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                        {birthdayAndAge(selectedAppoiment?.patientId?.birthday)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">
                        {selectedAppoiment?.patientId?.phone}
                    </Descriptions.Item>
                    <Descriptions.Item
                        label="Thời gian khám"
                        style={{ fontWeight: "bold" }}
                    >
                        {selectedAppoiment?.date} | {selectedAppoiment?.time} ~{" "}
                        {formatedTime(
                            dayjs(selectedAppoiment?.time, "HH:mm").add(30, "minute")
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lý do khám">
                        Sốt cao, họng đỏ, mệt mỏi
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={"blue"}>
                            {"Đang khám"}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <div>
                <Flex
                    gap={20}
                    align="center"
                    justify='space-between'
                    style={{ marginBottom: 20, marginTop: 20 }}
                >
                    <Typography.Title
                        level={3}
                        style={{ marginTop: 0, marginBottom: 0 }}
                    >
                        Lịch sử kết quả khám bệnh
                    </Typography.Title>
                    <Flex gap={20}>
                        <Button
                            type="primary"
                            onClick={() => setIsExaminationModalVisible(true)}
                        >
                            Kết quả khám bệnh
                        </Button>
                    </Flex>
                </Flex>

                {/* <Table dataSource={examinationHistory} columns={columns} /> */}
            </div>
            <Table className="bg-white rounded-lg shadow-md" dataSource={examinationHistory} columns={examinationColumns} />

            <div>
                <Flex gap={20}
                    align="center"
                    justify='space-between'
                    style={{ marginBottom: 20, marginTop: 20 }}
                >
                    <Typography.Title
                        level={3}
                        style={{ marginTop: 0, marginBottom: 0 }}
                    >
                        Lịch sử chuyển phòng
                    </Typography.Title>

                    <Button
                        type="default"
                        onClick={() => setIsTransferRoomVisible(true)}
                    >
                        Chuyển phòng
                    </Button>
                </Flex>
            </div>
            <Table className="bg-white rounded-lg shadow-md" dataSource={roomHistory} columns={roomColumns} />


            <ExaminationModal isVisible={isExaminationModalVisible} handleOk={handleExaminationOk} handleCancel={handleExaminationCancel} form={examinationForm} />
            <TransferRoomModal isVisible={isTransferRoomVisible} handleOk={handleTransferRoomOk} handleCancel={handleTransferRoomCancel} form={transferRoomForm} />
            <EditExaminationModal isVisible={isEditExaminationModalVisible} handleOk={handleEditExaminationOk} handleCancel={handleEditExaminationCancel} form={editExaminationForm} />
        </div>
    );
}

export default Examination;