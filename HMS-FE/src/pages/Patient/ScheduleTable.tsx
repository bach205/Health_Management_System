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
} from "antd";

import dayjs from "dayjs";

import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import { cancelAppointmentService } from '../../services/appointment.service';

const style = {
  ".ant-table-thead .ant-table-cell": {
    backgroundColor: "green",
  },
}

const ScheduleTable = ({ data = [], setReload, loading = false, visible, selectedPatient, onEdit, onCancel, reload, isPage, }: any) => {
 // const [reload, setReload] = useState(false);

  const handleEditAppointment = (record: any) => {
    onEdit(record);
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

  const hasPermissionEdit = (record: any) => {
    //Có thể chỉnh sửa nếu thời gian đặt cách thời gian hiện tại 2 tiếng
    return (
      <>
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
      render: (time: any) => time ? time.slice(0,5) : "",
    },
    {
      title: "Chuyên khoa",
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
    </ConfigProvider>
  )

};

export default ScheduleTable;
