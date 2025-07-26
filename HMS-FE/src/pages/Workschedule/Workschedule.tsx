import { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Input,
  Row,
  Col,
  Card,
} from 'antd';
import dayjs from 'dayjs';

import {
  createWorkScheduleService,
  updateWorkScheduleService,
  deleteWorkScheduleService,
  getWorkSchedulesService,
  getDoctorService,
} from '../../services/workschedule.service';
import { getClinicService } from '../../services/clinic.service';
import { getShiftService } from '../../services/shift.service';
import { Delete, PenLine, View } from 'lucide-react';

const { Title } = Typography;
const { Option } = Select;

export type WorkSchedule = {
  id: number;
  user_id: number;
  user_name: string;
  clinic_id: string;
  work_date: string;
  shift_id: number;
  shift_name: string;
};

const Workschedule = () => {
  const [data, setData] = useState<WorkSchedule[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WorkSchedule | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<WorkSchedule | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [change, setChange] = useState(true);
<<<<<<< HEAD

=======
  const [date, setDate] = useState<any>(null);
>>>>>>> 97c9bae0cba091498ba789d057a39e8356129e4f
  // Filter states
  const [filters, setFilters] = useState({
    dateRange: null as any,
    shiftId: null as any,
    clinicId: null as any,
    searchName: '',
  });

  // Helper function to filter shifts based on current time
  const getAvailableShifts = (allShifts: any[], shiftdate: any) => {

    const now = new Date();
    const currentDate = now.getFullYear().toString() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
      now.getMinutes().toString().padStart(2, '0');
    if (shiftdate == currentDate)
      return allShifts.filter(shift => {
        if (!shift.start_time) return false;
        // If editing, always include the current shift
        if (editingRecord && editingRecord.shift_id === shift.id) {
          return true;
        }
        // Parse start_time from ISO format (e.g., '1970-01-01T08:00:00.000')
        const shiftDate = new Date(shift.start_time);
        const shiftTimeOnly = shiftDate.getUTCHours().toString().padStart(2, '0') + ':' +
          shiftDate.getUTCMinutes().toString().padStart(2, '0');
        // Compare with current time
        return shiftTimeOnly > currentTime;
      });
    else return allShifts;
  };

  // Helper function to filter data based on filters
  const getFilteredData = (allData: WorkSchedule[]) => {
    return allData.filter(item => {
      // Filter by date range
      if (filters.dateRange && filters.dateRange.length === 2) {
        const itemDate = dayjs(item.work_date);
        const startDate = filters.dateRange[0];
        const endDate = filters.dateRange[1];
        if (!itemDate.isBetween(startDate, endDate, 'day', '[]')) {
          return false;
        }
      }

      // Filter by shift
      if (filters.shiftId && item.shift_id !== filters.shiftId) {
        return false;
      }

      // Filter by clinic
      if (filters.clinicId && item.clinic_id !== filters.clinicId) {
        return false;
      }

      // Filter by employee name
      if (filters.searchName && !item.user_name.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  useEffect(() => {
    const fetchData = async () => {

      const res = await getWorkSchedulesService();
      const user = await getDoctorService();
      const clinic = await getClinicService();
      const shift = await getShiftService();
      //       console.log(clinic);
      //     console.log(user.data.metadata);
      setShifts(shift.data.data);
      setClinics(clinic.data.metadata.clinics);
      setUsers(user.data.metadata);
      const enrichedData = res.data.data.map((item: any) => ({
        ...item,
        user_name: user.data.metadata.find((u: any) => u.id === item.user_id)?.full_name || '',
        shift_name: shift.data.data.find((s: any) => s.id === item.shift_id)?.name || '',
      }));
      setData(enrichedData);
    };

    fetchData();
  }, [change]);
  console.log(shifts)
  const handleView = (record: WorkSchedule) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };
  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);

  };

  const handleEdit = (record: WorkSchedule) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      work_date: dayjs(record.work_date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteWorkScheduleService(id.toString());
      setData(prev => prev.filter(item => item.id !== id));
      message.success('Xoá thành công');
    } catch {
      message.error('Xoá thất bại');
    }
  };

  // Filter handlers
  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  const handleShiftChange = (value: any) => {
    setFilters(prev => ({ ...prev, shiftId: value }));
  };

  const handleClinicChange = (value: any) => {
    setFilters(prev => ({ ...prev, clinicId: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchName: e.target.value }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: null,
      shiftId: null,
      clinicId: null,
      searchName: '',
    });
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      user_id: values.user_id,
      clinic_id: values.clinic_id,
      work_date: dayjs(values.work_date).format('YYYY-MM-DD'),
      shift_id: values.shift_id,
    };
    try {
      if (editingRecord) {
        await updateWorkScheduleService(payload, editingRecord.id.toString());
        setData(prev =>
          prev.map(item =>
            item.id === editingRecord.id
              ? {
                ...item,
                ...payload,
                user_name: users.find(u => u.id === payload.user_id)?.name || '',
                shift_name: shifts.find(s => s.id === payload.shift_id)?.name || '',
              }
              : item
          )
        );

        message.success('Cập nhật thành công');
      } else {
        const res = await createWorkScheduleService(payload);
        const newSchedule = res.data.data;
        setData(prev => [
          ...prev,
          {
            id: newSchedule.id,
            user_id: newSchedule.user_id,
            user_name: users.find(u => u.id === newSchedule.user_id)?.full_name || '',
            clinic_id: newSchedule.clinic_id,
            work_date: newSchedule.work_date,
            shift_id: newSchedule.shift_id,
            shift_name: shifts.find(s => s.id === newSchedule.shift_id)?.name || '',
          },
        ]);
        message.success('Tạo mới thành công');
      }
      setChange(!change);
      setIsModalVisible(false);
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'user_name',
      key: 'user_name',
      sorter: (a: WorkSchedule, b: WorkSchedule) =>
        a.user_name.localeCompare(b.user_name),
    },
    {
      title: 'Phòng khám',
      dataIndex: 'clinic_id',
      key: 'clinic_id',
      render: (id: string) =>
        clinics.find(c => c.id === id)?.name || `Phòng khám #${id}`,
    },
    {
      title: 'Ngày',
      dataIndex: 'work_date',
      key: 'work_date',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
      sorter: (a: WorkSchedule, b: WorkSchedule) =>
        dayjs(a.work_date).unix() - dayjs(b.work_date).unix(),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Ca',
      dataIndex: 'shift_name',
      key: 'shift_name',
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: WorkSchedule) => {
        const today = dayjs().startOf('day');
        const workDate = dayjs(record.work_date);
        const isPastDate = workDate.isBefore(today);

        return (
          <>
            <Button onClick={() => handleView(record)} size="small" className="mr-2">
              <View size={15} />
            </Button>
            {!isPastDate && (
              <>
                <Button onClick={() => handleEdit(record)} size="small">
                  <PenLine size={15} />
                </Button>
                <Popconfirm title="Xoá?" onConfirm={() => handleDelete(record.id)}>
                  <Button danger size="small" className="ml-2">
                    <Delete size={15} />
                  </Button>
                </Popconfirm>
              </>
            )}
          </>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Lịch Làm Việc</Title>

      {/* Filter Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Khoảng thời gian:</div>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filters.dateRange}
                onChange={handleDateRangeChange}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Ca làm việc:</div>
              <Select
                placeholder="Chọn ca làm"
                style={{ width: '100%' }}
                allowClear
                value={filters.shiftId}
                onChange={handleShiftChange}
              >
                {shifts.map(shift => (
                  <Option key={shift.id} value={shift.id}>
                    {shift.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Phòng khám:</div>
              <Select
                placeholder="Chọn phòng khám"
                style={{ width: '100%' }}
                allowClear
                value={filters.clinicId}
                onChange={handleClinicChange}
              >
                {clinics.map(clinic => (
                  <Option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Tìm kiếm nhân viên:</div>
              <Input
                placeholder="Nhập tên nhân viên"
                value={filters.searchName}
                onChange={handleSearchChange}
                allowClear
              />
            </div>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col>
            <Button onClick={handleClearFilters} style={{ marginRight: 8 }}>
              Xóa bộ lọc
            </Button>
            <Button type="primary" onClick={handleCreate}>
              Thêm Lịch
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={getFilteredData(data)}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRecord ? 'Cập Nhật Lịch' : 'Thêm Lịch'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => {
          form.submit();
          setChange(!change);
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="user_id" label="Nhân viên" rules={[{ required: true }]}>
            <Select placeholder="Chọn nhân viên">
              {users.map(user => (

                <Option key={user.id} value={user.id}>
                  {user.full_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="clinic_id" label="Phòng khám" rules={[{ required: true }]}>
            <Select placeholder="Chọn phòng khám">
              {clinics.map(clinic => (
                <Option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="work_date" label="Ngày làm việc" rules={[{ required: true, message: 'Vui lòng chọn ngày làm việc' }, ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || value.isSameOrAfter(dayjs(), 'day')) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Chỉ được chọn ngày hiện tại hoặc lớn hơn!'));
            },
          })]}>
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={current => current && current.isBefore(dayjs().startOf('day'))}
              onChange={() => setDate(form.getFieldValue('work_date').format('YYYY-MM-DD'))}
            />
          </Form.Item>
          <Form.Item name="shift_id" label="Ca làm" rules={[{ required: true }]}>
            <Select placeholder="Chọn ca làm">
              {getAvailableShifts(shifts, date).map(shift => (
                <Option key={shift.id} value={shift.id}>
                  {shift.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi tiết lịch làm việc"
        open={isDetailModalVisible}
        footer={null}
        onCancel={() => setIsDetailModalVisible(false)}
      >
        {selectedRecord && (
          <div>
            <p><strong>Nhân viên:</strong> {selectedRecord.user_name}</p>
            <p><strong>Phòng khám:</strong> {clinics.find(c => c.id === selectedRecord.clinic_id)?.name}</p>
            <p><strong>Ngày làm:</strong> {dayjs(selectedRecord.work_date).format('DD/MM/YYYY')}</p>
            <p><strong>Ca làm:</strong> {selectedRecord.shift_name}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Workschedule;

