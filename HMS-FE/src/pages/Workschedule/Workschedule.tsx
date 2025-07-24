import React, { useEffect, useState } from 'react';
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
import { getAllNurse } from '../../services/nurse.service';

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

type Staff = {
  email : string,
  full_name : string,
  gender : string,
  id : number,
  phone : string,
}

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
  useEffect(() => {
    const fetchData = async () => {

      const res = await getWorkSchedulesService();
      const user = await getDoctorService();
      const clinic = await getClinicService();
      const shift = await getShiftService();
      console.log(user.data.metadata);
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

  const handleSubmit = async (values: any) => {
    const payload = {
      user_id: values.user_id,
      clinic_id: values.clinic_id,
      work_date: dayjs(values.work_date).format('YYYY-MM-DD'),
      shift_id: values.shift_id,
    };
    console.log(payload);
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
      render: (_: any, record: WorkSchedule) => (
        <>
          <Button onClick={() => handleView(record)} size="small" className="mr-2"><View size={15} /></Button>
          <Button onClick={() => handleEdit(record)} size="small">
            <PenLine size={15} />
          </Button>
          <Popconfirm title="Xoá?" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" className="ml-2">
              <Delete size={15} />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Lịch Làm Việc</Title>
      <Button type="primary" onClick={handleCreate} className="mb-4">
        Thêm Lịch
      </Button>
      <Table
        columns={columns}
        dataSource={data}
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
            />
          </Form.Item>
          <Form.Item name="shift_id" label="Ca làm" rules={[{ required: true }]}>
            <Select placeholder="Chọn ca làm">
              {shifts.map(shift => (
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
