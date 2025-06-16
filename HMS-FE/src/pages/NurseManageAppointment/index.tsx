import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  message,
  Tag,
  Space,
  Modal,
  Input,
  Tooltip,
  Select,
  DatePicker
} from 'antd';
import type { TableProps } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { getAllAppointmentsService, confirmAppointmentService, cancelAppointmentService } from '../../services/appointment.service';

interface Appointment {
  id: number;
  patient_name: string;
  patient_email: string;
  identity_number: string;
  doctor_name: string;
  clinic_name: string;
  formatted_date: string;
  formatted_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  note: string;
  priority: number;
  created_at: string;
}

interface Filters {
  status: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  search: string;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

const NurseManageAppointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    dateRange: null,
    search: '',
  });

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointmentsService();
      let filteredData = response.data;

      // Filter by status
      if (filters.status !== 'all') {
        filteredData = filteredData.filter((appointment: Appointment) => 
          appointment.status === filters.status
        );
      }

      // Filter by date range
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = dayjs(filters.dateRange[0]).startOf('day');
        const endDate = dayjs(filters.dateRange[1]).endOf('day');
        filteredData = filteredData.filter((appointment: Appointment) => {
          const appointmentDate = dayjs(appointment.formatted_date);
          return appointmentDate.isAfter(startDate) && appointmentDate.isBefore(endDate);
        });
      }

      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((appointment: Appointment) => 
          appointment.patient_name.toLowerCase().includes(searchLower) ||
          appointment.doctor_name.toLowerCase().includes(searchLower) ||
          appointment.patient_email.toLowerCase().includes(searchLower) ||
          appointment.identity_number.includes(searchLower)
        );
      }

      setAppointments(filteredData);
    } catch (error) {
      message.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
      setLoading(true);
      await confirmAppointmentService(appointment);
      message.success('Xác nhận lịch hẹn thành công');
      fetchAppointments();
    } catch (error) {
      message.error('Không thể xác nhận lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      await cancelAppointmentService({ 
        id: selectedAppointment.id, 
        reason: rejectReason 
      });
      message.success('Hủy lịch hẹn thành công');
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      message.error('Không thể hủy lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const showRejectModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRejectModalVisible(true);
  };

  const getStatusTag = (status: Appointment['status']) => {
    const statusConfig = {
      pending: { color: 'gold', text: 'Chờ xác nhận' },
      confirmed: { color: 'green', text: 'Đã xác nhận' },
      cancelled: { color: 'red', text: 'Đã hủy' },
      completed: { color: 'blue', text: 'Đã hoàn thành' }
    };

    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Tên bệnh nhân',
      dataIndex: 'patient_name',
      key: 'patient_name',
      sorter: true,
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <div>{record.patient_email}</div>
          <div>CCCD: {record.identity_number}</div>
        </Space>
      ),
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
    },
    {
      title: 'Phòng khám',
      dataIndex: 'clinic_name',
      key: 'clinic_name',
    },
    {
      title: 'Ngày & Giờ',
      key: 'datetime',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <div>{dayjs(record.formatted_date).format('DD/MM/YYYY')}</div>
          <div>{record.formatted_time}</div>
        </Space>
      ),
      sorter: true,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: Appointment) => getStatusTag(record.status),
      filters: [
        { text: 'Chờ xác nhận', value: 'pending' },
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đã hủy', value: 'cancelled' },
        { text: 'Đã hoàn thành', value: 'completed' },
      ],
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="max-w-[200px] truncate">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Appointment) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirmAppointment(record)}
              >
                Xác nhận
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record)}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title="Quản lý lịch hẹn">
        {/* Filters */}
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Tìm kiếm tên bệnh nhân hoặc bác sĩ"
            prefix={<SearchOutlined />}
            className="max-w-xs"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            allowClear
          />
          <Select
            placeholder="Lọc theo trạng thái"
            className="min-w-[150px]"
            value={filters.status}
            onChange={status => setFilters(prev => ({ ...prev, status }))}
            allowClear
          >
            <Option value="all">Tất cả</Option>
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="completed">Đã hoàn thành</Option>
          </Select>
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            format="DD/MM/YYYY"
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Lý do hủy lịch hẹn"
          open={rejectModalVisible}
          onOk={handleRejectAppointment}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason('');
            setSelectedAppointment(null);
          }}
          confirmLoading={loading}
        >
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Nhập lý do hủy lịch hẹn"
          />
        </Modal>
      </Card>
    </div>
  );
};

export default NurseManageAppointment; 