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
import dayjs from 'dayjs';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  symptoms: string;
  createdAt: string;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

const NurseManageAppointment: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState({
    status: 'pending',
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
      // TODO: Replace with actual API call
      // Example API call:
      // const response = await appointmentService.getNurseAppointments(filters);
      // setAppointments(response.data);
      
      // Temporary mock data
      setAppointments([
        {
          id: '1',
          patientName: 'John Doe',
          patientEmail: 'john@example.com',
          patientPhone: '1234567890',
          doctorName: 'Dr. Smith',
          appointmentDate: '2024-03-20',
          appointmentTime: '10:00',
          status: 'pending',
          symptoms: 'Fever and headache',
          createdAt: '2024-03-18T10:00:00Z'
        },
        // Add more mock data as needed
      ]);
    } catch (error) {
      message.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await appointmentService.confirmAppointment(appointment.id);
      
      message.success('Appointment confirmed successfully');
      fetchAppointments();
    } catch (error) {
      message.error('Failed to confirm appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await appointmentService.rejectAppointment(selectedAppointment.id, rejectReason);
      
      message.success('Appointment rejected successfully');
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      message.error('Failed to reject appointment');
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
      pending: { color: 'gold', text: 'Pending' },
      confirmed: { color: 'green', text: 'Confirmed' },
      rejected: { color: 'red', text: 'Rejected' },
      completed: { color: 'blue', text: 'Completed' }
    };

    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
      sorter: true,
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <div>{record.patientEmail}</div>
          <div>{record.patientPhone}</div>
        </Space>
      ),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (record: Appointment) => (
        <Space direction="vertical" size="small">
          <div>{dayjs(record.appointmentDate).format('MMM DD, YYYY')}</div>
          <div>{record.appointmentTime}</div>
        </Space>
      ),
      sorter: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Appointment) => getStatusTag(record.status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Completed', value: 'completed' },
      ],
    },
    {
      title: 'Symptoms',
      dataIndex: 'symptoms',
      key: 'symptoms',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="max-w-[200px] truncate">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
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
                Confirm
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title="Manage Appointments">
        {/* Filters */}
        <div className="mb-4 flex gap-4">
          <Input
            placeholder="Search patient name or doctor"
            prefix={<SearchOutlined />}
            className="max-w-xs"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <Select
            placeholder="Filter by status"
            className="min-w-[150px]"
            value={filters.status}
            onChange={status => setFilters(prev => ({ ...prev, status }))}
          >
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="completed">Completed</Option>
          </Select>
          <RangePicker
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates as null }))}
          />
        </div>

        {/* Appointments Table */}
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="id"
          loading={loading}
          pagination={{
            total: appointments.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} appointments`,
          }}
        />

        {/* Reject Modal */}
        <Modal
          title="Reject Appointment"
          open={rejectModalVisible}
          onOk={handleRejectAppointment}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason('');
            setSelectedAppointment(null);
          }}
          confirmLoading={loading}
        >
          <p>Are you sure you want to reject this appointment?</p>
          <Input.TextArea
            rows={4}
            placeholder="Please provide a reason for rejection"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            className="mt-4"
          />
        </Modal>
      </Card>
    </div>
  );
};

export default NurseManageAppointment; 