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
} from "antd";

import dayjs from "dayjs";

import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";


const style = {
  ".ant-table-thead .ant-table-cell": {
    backgroundColor: "green",
  },
}

const ScheduleTable = ({ visible, selectedPatient, onEdit, onCancel, reload: reloadSchedule, isPage, }: any) => {
  const [appointments, setAppointments] = useState([]);
  const [reload, setReload] = useState(false);

  const handleEditAppointment = (record: any) => {
    // TODO: Edit appinment
    onEdit(record);
  };

  const handleCancelAppmt = async (record: any) => {
    try {
      //   await updateStatusAppointment({
      //     appointmentId: record._id,
      //     status: "cancelled",
      //   });

      setReload(!reload);
      notification.success({
        message: "Cập nhật thành công",
      });
    } catch (error) {
      notification.error({
        message: "Cập nhật không thành công",
      });
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
  const data = [
    {
      _id: "1",
      createdAt: "2021-01-01",
      date: "2021-01-01",
      time: "10:00",
      specialty: "Cardiologist",
      doctorId: "1",
      status: "booked",
    }
  ]
  const columns = [
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (createdAt: any) => {
        return dayjs(createdAt).format("HH:mm:ss DD/MM/YYYY");
      },
    },
    {
      title: "Ngày khám",
      dataIndex: "date",
      width: 120,
      key: "date",
      render: (text: any) => {
        return dayjs(text, "DD/MM/YYYY").format("DD/MM/YYYY");
      },
    },
    {
      width: 120,
      title: "Giờ dự kiến",
      dataIndex: "time",
      align: "center",
      key: "time",
      render: (text: any) => {
        return dayjs(text, "HH:mm").format("HH:mm");
      },
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialty",
      key: "specialty",
      render: (key: any) => {
        return key;
      },
    },
    {
      width: 150,
      title: "Bác sĩ",
      dataIndex: "doctorId",
      key: "doctorId",
      render: (doctor: any) => {
        return doctor?.fullName || "Chưa xác định";
      },
    },
    {
      title: "Trạng thái",
      align: "center",
      dataIndex: "status",
      key: "status",
      render: (key: any) => {
        return (
          <Tag color={"green"}>{key}</Tag>
        );
      },
    },
    {
      title: "Hành động",
      width: 150,
      key: "action",
      align: "center",
      render: (text: any, record: any) => {
        return <Flex gap={10} justify="center">{hasPermissionEdit(record)}</Flex>;
      },
    },
  ];

  useEffect(() => {
    const initData = async () => {
      // Replace this with the actual API call to fetch appointments
      const { appointments } = { appointments: [] };
      setAppointments(appointments);
    };
    if (visible && selectedPatient?._id) {
      initData();
    }
  }, [selectedPatient?._id, visible, reload, reloadSchedule]);



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
        scroll={{ y: 300 }}
        rowKey="_id"
        columns={columns as any}
        dataSource={data}
      />
    </ConfigProvider>
  )

};

export default ScheduleTable;
