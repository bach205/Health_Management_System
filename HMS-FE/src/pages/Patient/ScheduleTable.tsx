// ViewScheduleModal.js
import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Table,
  Calendar,
  Popconfirm,
  Typography,
  notification,
  Tag,
  Flex,
  Divider,
  Tooltip,
  ConfigProvider,
  Input,
  Row,
  Col,
} from "antd";

import dayjs from "dayjs";

import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { cancelAppointmentService, deleteAppointmentService } from '../../services/appointment.service';
import { useNavigate } from "react-router-dom";

const style = {
  ".ant-table-thead .ant-table-cell": {
    backgroundColor: "green",
  },
}

const ScheduleTable = ({ data = [], setReload, loading = false, visible, selectedPatient, onEdit, onCancel, reload, isPage, }: any) => {
  // const [reload, setReload] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const navigate = useNavigate();
  const handleEditAppointment = (record: any) => {
    onEdit(record);
  };

  const handleViewAppointment = (record: any) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  const handleViewModalCancel = () => {
    setViewModalVisible(false);
    setSelectedRecord(null);
  };

  const handleCancelAppmt = async (record: any) => {
    try {
      let reason = '';
      Modal.confirm({
        title: 'Xác nhận huỷ lịch khám',
        content: (
          <>
            <Typography.Text>Nhập lý do huỷ (tuỳ chọn):</Typography.Text>
            <Input.TextArea onChange={e => reason = e.target.value} />
          </>
        ),
        onOk: async () => {
          await cancelAppointmentService({ id: record._id || record.id, reason });
          setReload(!reload);
          notification.success({ message: 'Huỷ lịch thành công' });
          //   if (typeof reloadSchedule === 'function') reloadSchedule((r: any) => !r);
        },
        okText: 'Xác nhận',
        cancelText: 'Không',
      });
    } catch (error) {
      notification.error({ message: 'Huỷ lịch không thành công' });
    }
  };

  const handleDeleteAppointment = async (record: any) => {
    try {
      Modal.confirm({
        title: 'Xác nhận xoá lịch khám',
        content: (
          <>
            <Typography.Text>Bạn có chắc muốn xoá lịch hẹn này?</Typography.Text>
          </>
        ),
        onOk: async () => {
          await deleteAppointmentService(record._id || record.id);
          setReload(!reload);
          notification.success({ message: 'Xoá lịch thành công' });
        },
        okText: 'Xác nhận',
        cancelText: 'Không',
      });
    } catch (error) {
      notification.error({ message: 'Xoá lịch không thành công' });
    }
  };

  const hasPermissionEdit = (record: any) => {
    if (record.status === "completed" || true) {
      return (
        <Tooltip title="Xem kết quả khám">
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`record/${record._id || record.id}`)}
          >
            Xem kết quả khám
          </Button>
        </Tooltip>
      );
    }
    return (
      <>
        <Tooltip title="Xem chi tiết">
          <Button
            type="default"
            size="small"
            onClick={() => handleViewAppointment(record)}
          >
            <InfoCircleOutlined />
          </Button>
        </Tooltip>
        <Tooltip title="Chỉnh sửa lịch khám">
          <Button
            type="default"
            size="small"
            onClick={() => handleEditAppointment(record)}
          >
            <EditOutlined />
          </Button>
        </Tooltip>
        <Popconfirm
          icon={<DeleteOutlined style={{ color: "red" }} />}
          title="Hủy lịch khám bệnh"
          description={
            <>
              <Typography.Text>Xác nhận hủy lịch ngày: </Typography.Text>{" "}
              <strong>
                {record.date} - {record.time}?
              </strong>
            </>
          }
          onConfirm={() => handleCancelAppmt(record)}
          okText="Xác nhận"
          cancelText="Không"
        >
          <Tooltip title="Hủy lịch khám">
            <Button type="default" danger size="small">
              <CloseOutlined />
            </Button>
          </Tooltip>
        </Popconfirm>
        {record.status !== 'cancelled' && record.status !== 'completed' && (
          <Tooltip title="Xoá lịch hẹn">
            <Button type="default" danger size="small" onClick={() => handleDeleteAppointment(record)}>
              <DeleteOutlined />
            </Button>
          </Tooltip>
        )}
      </>
    )
  }

  const columns = [
    {
      title: "Ngày đặt",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (created_at: any) => dayjs(created_at).format("HH:mm:ss DD/MM/YYYY"),
    },
    {
      title: "Ngày khám",
      dataIndex: "formatted_date",
      key: "formatted_date",
      width: 120,
      render: (date: any) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ dự kiến",
      dataIndex: "formatted_time",
      key: "formatted_time",
      width: 110,
      align: "center" as const,
      render: (time: any) => time ? time.slice(0, 5) : "",
    },
    {
      title: "Phòng khám",
      dataIndex: "clinic_name",
      key: "clinic_name",
      width: 160,
      render: (text: any) => text,
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor_name",
      key: "doctor_name",
      width: 150,
      render: (text: any) => text,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: string) => {
        let color = "default";
        let text = status;
        if (status === "pending") { color = "gold"; text = "Chờ xác nhận"; }
        else if (status === "confirmed") { color = "green"; text = "Đã xác nhận"; }
        else if (status === "cancelled") { color = "red"; text = "Đã hủy"; }
        else if (status === "completed") { color = "blue"; text = "Đã hoàn thành"; }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hành động",
      width: 120,
      key: "action",
      align: "center" as const,
      render: (text: any, record: any) => {
        return <Flex gap={10} justify="center">{hasPermissionEdit(record)}</Flex>;
      },
    },
  ];

  return (
    <ConfigProvider theme={{
      components: {
        Table: {
          headerBg: "#fff",
          headerColor: "#5f6fff",
        },
        Pagination: {
          colorPrimary: "#5f6fff",
          colorPrimaryText: "#fff",
          colorPrimaryTextHover: "#fff",
          colorPrimaryTextActive: "#fff",
          colorPrimaryHover: "#5f8aff",
          colorPrimaryActive: "#5f8aff",
        }

      },
    }}>
      <Table
        dataSource={data}
        loading={loading}
        columns={columns}
        rowKey={record => record._id || record.id}
        pagination={{ pageSize: 10 }}
      />

      {/* View Appointment Modal */}
      <Modal
        title="Chi tiết lịch hẹn khám"
        open={viewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="close" onClick={handleViewModalCancel}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="font-medium text-gray-700">Ngày đặt lịch:</div>
                <div>{dayjs(selectedRecord.created_at).format("HH:mm:ss DD/MM/YYYY")}</div>
              </Col>
              <Col span={12}>
                <div className="font-medium text-gray-700">Ngày khám:</div>
                <div>{dayjs(selectedRecord.formatted_date).format("DD/MM/YYYY")}</div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="font-medium text-gray-700">Giờ khám:</div>
                <div>{selectedRecord.formatted_time ? selectedRecord.formatted_time.slice(0, 5) : "Chưa xác định"}</div>
              </Col>
              <Col span={12}>
                <div className="font-medium text-gray-700">Trạng thái:</div>
                <div>
                  {(() => {
                    let color = "default";
                    let text = selectedRecord.status;
                    if (selectedRecord.status === "pending") { color = "gold"; text = "Chờ xác nhận"; }
                    else if (selectedRecord.status === "confirmed") { color = "green"; text = "Đã xác nhận"; }
                    else if (selectedRecord.status === "cancelled") { color = "red"; text = "Đã hủy"; }
                    else if (selectedRecord.status === "completed") { color = "blue"; text = "Đã hoàn thành"; }
                    return <Tag color={color}>{text}</Tag>;
                  })()}
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="font-medium text-gray-700">Phòng khám:</div>
                <div>{selectedRecord.clinic_name || "Chưa xác định"}</div>
              </Col>
              <Col span={12}>
                <div className="font-medium text-gray-700">Bác sĩ:</div>
                <div>{selectedRecord.doctor_name || "Chưa xác định"}</div>
              </Col>
            </Row>

            {selectedRecord.note && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="font-medium text-gray-700">Ghi chú:</div>
                  <div className="bg-gray-50 p-3 rounded">{selectedRecord.note}</div>
                </Col>
              </Row>
            )}

            {selectedRecord.reason && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="font-medium text-gray-700">Lý do hủy:</div>
                  <div className="bg-red-50 p-3 rounded text-red-700">{selectedRecord.reason}</div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </ConfigProvider>
  )

};

export default ScheduleTable;
