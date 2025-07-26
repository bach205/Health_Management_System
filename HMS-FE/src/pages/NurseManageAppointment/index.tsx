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
import { Link } from "react-router-dom";
import NurseRescheduleAppointment from '../RescheduleAppointment';
import type { Key } from 'react';

interface Filters {
  status: string;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  search: string;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

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
  patient_phone?: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const NurseManageAppointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    dateRange: [dayjs(), dayjs().add(1, 'day')],
    search: '',
  });
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
  const [showRescheduleButton, setShowRescheduleButton] = useState(false);
  const isMobile = useIsMobile();

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAllAppointmentsService();
      let filteredData = response.data;
      console.log(filteredData)

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
      setShowRescheduleButton(false);
      // Reload the page after successful cancellation
      window.location.reload();
    } catch (error) {
      message.error('Không thể hủy lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const showRejectModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRejectModalVisible(true);
    setShowRescheduleButton(false);
    setRejectReason('');
  };

  const handleRejectReasonChange = (value: string) => {
    setRejectReason(value);
  };

  const handleRescheduleClick = () => {
    if (selectedAppointment) {
      setRescheduleAppointment(selectedAppointment);
      setRescheduleModalVisible(true);
      setRejectModalVisible(false);
      setRejectReason('');
      setShowRescheduleButton(false);
    }
  };

  const showRescheduleModal = (appointment: Appointment) => {
    setRescheduleAppointment(appointment);
    setRescheduleModalVisible(true);
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
      sorter: (a: Appointment, b: Appointment) => a.patient_name.localeCompare(b.patient_name),
      className: 'whitespace-nowrap',
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <div>Email: {record.patient_email}</div>
          <div>SĐT: {record.patient_phone || '-'}</div>
        </Space>
      ),
      className: 'whitespace-nowrap',
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
      className: 'whitespace-nowrap',
    },
    {
      title: 'Phòng khám',
      dataIndex: 'clinic_name',
      key: 'clinic_name',
      className: 'whitespace-nowrap',
    },
    {
      title: 'Ngày',
      dataIndex: 'formatted_date',
      key: 'formatted_date',
      sorter: (a: Appointment, b: Appointment) => dayjs(a.formatted_date).unix() - dayjs(b.formatted_date).unix(),
      render: (date: string) => <div>{dayjs(date).format('DD/MM/YYYY')}</div>,
      className: 'whitespace-nowrap',
    },
    {
      title: 'Giờ',
      dataIndex: 'formatted_time',
      key: 'formatted_time',
      sorter: (a: Appointment, b: Appointment) => a.formatted_time.localeCompare(b.formatted_time),
      className: 'whitespace-nowrap',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: Appointment, b: Appointment) => a.status.localeCompare(b.status),
      render: (status: Appointment['status']) => getStatusTag(status),
      className: 'whitespace-nowrap',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Appointment) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Button
            type="primary"
            onClick={() => handleConfirmAppointment(record)}
            block
            disabled={record.status !== "pending"}
          >
            Xác nhận
          </Button>
          {record.status === "cancelled" ? (
            <Button
              type="primary"
              onClick={() => showRescheduleModal(record)}
              block
            >
              Đổi lịch khám
            </Button>
          ) : record.status === "pending" ? (
            <Button danger onClick={() => showRejectModal(record)} block>
              Hủy
            </Button>
          ) : record.status === "confirmed" || record.status === "completed" ? (
            <Button
              disabled
              block
              style={{ color: '#999', borderColor: '#d9d9d9' }}
            >
              Không thể thao tác
            </Button>
          ) : (
            <Button
              onClick={() => showRejectModal(record)}
              block
            >
              Đổi lịch khám
            </Button>
          )}
        </Space>
      ),
      className: 'whitespace-nowrap',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-full">
      <Card title="Quản lý lịch hẹn" className="shadow-md rounded-lg overflow-hidden">
        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
          <Input
            placeholder="Tìm kiếm tên bệnh nhân hoặc bác sĩ"
            prefix={<SearchOutlined />}
            className="max-w-full sm:max-w-xs"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            allowClear
            size="large"
          />
          <Select
            placeholder="Lọc theo trạng thái"
            className="min-w-[150px] max-w-full"
            value={filters.status}
            onChange={status => setFilters(prev => ({ ...prev, status }))}
            allowClear
            size="large"
          >
            <Option value="all">Tất cả</Option>
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="completed">Đã hoàn thành</Option>
          </Select>
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => { console.log(filters.dateRange); return setFilters(prev => ({ ...prev, dateRange: dates })) }}
            format="DD/MM/YYYY"
            allowClear
            className="w-full sm:w-auto"
            size="large"
          />
        </div>
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            dataSource={appointments}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered={false}
            scroll={{ x: 'max-content' }}
          />
        </div>

        <Modal
          title="Lý do hủy lịch hẹn"
          open={rejectModalVisible}
          footer={null}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason('');
            setSelectedAppointment(null);
            setShowRescheduleButton(false);
          }}
          width={window.innerWidth < 640 ? '98vw' : 800}
          bodyStyle={{ maxHeight: window.innerWidth < 640 ? 350 : 500, overflowY: 'auto', padding: window.innerWidth < 640 ? 12 : 24 }}
          className="max-w-full"
        >
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={e => handleRejectReasonChange(e.target.value)}
            placeholder="Nhập lý do hủy lịch hẹn"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              danger
              onClick={handleRejectAppointment}
              loading={loading}
            >
              Hủy luôn
            </Button>
          </div>
        </Modal>

        <Modal
          title="Đặt lại lịch khám"
          open={rescheduleModalVisible}
          onCancel={() => {
            setRescheduleModalVisible(false);
            setRescheduleAppointment(null);
          }}
          footer={null}
          width={window.innerWidth < 640 ? '98vw' : 800}
          bodyStyle={{ maxHeight: window.innerWidth < 640 ? 400 : 500, overflowY: 'auto', padding: window.innerWidth < 640 ? 12 : 24 }}
          className="max-w-full"
          centered
          maskClosable={false}
          destroyOnClose
          style={{ top: '40%', transform: 'translateY(-50%)' }}
        >
          {rescheduleAppointment && (
            <NurseRescheduleAppointment
              appointment={rescheduleAppointment}
              onSuccess={() => {
                setRescheduleModalVisible(false);
                setRescheduleAppointment(null);
                fetchAppointments();
              }}
            />
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default NurseManageAppointment; 