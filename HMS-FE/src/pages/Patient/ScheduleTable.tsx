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
import { getInvoiceDetail, getInvoiceList } from "../../services/payment.service";
import ViewPayment from "./ViewPayment";

const style = {
  ".ant-table-thead .ant-table-cell": {
    backgroundColor: "green",
  },
}

const ScheduleTable = ({ data = [], setReload, loading = false, visible, selectedPatient, onEdit, onCancel, reload, isPage, }: any) => {
  // const [reload, setReload] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const [viewPaymentModalVisible, setViewPaymentModalVisible] = useState(false);
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<any>(null);

  const navigate = useNavigate();


  const handleViewInvoice = async (record: any) => {
    try {
      const [detailRes, listRes] = await Promise.all([
        getInvoiceDetail(record.id), // lấy danh sách dịch vụ
        getInvoiceList(),            // lấy danh sách invoice tổng
      ]);

      const foundInvoice = listRes.data.find((i: any) => i.record_id === record.id);
      setInvoiceItems(detailRes.data || []);
      setSelectedInvoice(foundInvoice);
      setModalVisible(true);
    } catch (err) {
      notification.error({ message: 'Không thể tải chi tiết hóa đơn' });
    }
  };


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

  const handleViewPayment = (record: any) => {
    setSelectedPaymentRecord(record);
    setViewPaymentModalVisible(true);
  }

  const handleViewPaymentModalCancel = () => {
    setViewPaymentModalVisible(false);
    setSelectedPaymentRecord(null);
  }

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

  const hasPermissionEdit = (record: any) => {
    if (record.status === "completed") {
      // // const invoice = selectedInvoiceList.find(i => i.record_id === record.id); // giả sử bạn truyền invoiceList từ parent hoặc fetch trước

      if (record?.payment_status === "pending") {
        return (
          <>
            <Tooltip title="Xem hóa đơn">
              <Button type="primary" size="small" onClick={() => handleViewPayment(record)}>
                Xem hóa đơn
              </Button>
            </Tooltip>
            <Tooltip title="Bạn cần thanh toán trước khi xem kết quả khám">
              <Button type="primary" size="small" disabled>
                Xem kết quả khám
              </Button>
            </Tooltip>
          </>
        );
      } else if (record?.payment_status === "paid") {
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
        )
      } else if (record?.payment_status === "canceled") {
        return (
          <p className="text-red-500">Bạn đã hủy hóa đơn</p>
        )
      }
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
        {/* Ẩn nút chỉnh sửa nếu trạng thái là 'confirmed' */}
        {record.status !== 'confirmed' && (
          <Tooltip title="Chỉnh sửa lịch khám">
            <Button
              type="default"
              size="small"
              onClick={() => handleEditAppointment(record)}
            >
              <EditOutlined />
            </Button>
          </Tooltip>
        )}
        {/* Ẩn nút huỷ nếu trạng thái là 'confirmed' */}
        {record.status !== 'confirmed' && (
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
        )}
        {/* Đã xoá nút xoá lịch hẹn */}
      </>
    )
  }

  console.log("selectedRecord", selectedRecord)
  const columns = [
    {
      title: "Ngày đặt",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (created_at: any) => dayjs(created_at).format("HH:mm:ss DD/MM/YYYY"),
    },
    {
      title: "Ngày Đặt Lịch",
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
      title: "Bác sĩ đặt",
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
        else if (status === "completed") { color = "blue"; text = "Đã khám xong"; }
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
        pagination={{ showSizeChanger: true, pageSizeOptions: ["1", "3", "5", "7", "9"] }}
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
                <div className="font-medium text-gray-700">Ngày Đặt Lịch:</div>
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

            {/* {selectedRecord.reason && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="font-medium text-gray-700">Lý do hủy:</div>
                  <div className="bg-red-50 p-3 rounded text-red-700">{selectedRecord.reason}</div>
                </Col>
              </Row>
            )} */}
          </div>
        )}
      </Modal>
      <ViewPayment
        record={selectedPaymentRecord}
        modalVisible={viewPaymentModalVisible}
        setModalVisible={handleViewPaymentModalCancel}
        setReload={setReload}
        reload={reload}
      />
    </ConfigProvider>
  )

};

export default ScheduleTable;
