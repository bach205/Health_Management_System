import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Form, Input, Modal, Popconfirm, message } from 'antd';
import { createShiftService, deteleShiftService, getShiftService, updateShiftService } from '../../services/shift.service';
import { Delete, Eye, PenLine } from 'lucide-react';

const { Title } = Typography;

export type Shift = {
  id: number;
  name: string;
  start_time: string; // HH:mm format
  end_time: string;   // HH:mm format
};

const formatDateToHHmm = (isoString: string) => {
  const date = new Date(isoString);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const convertHHmmToISOString = (time: string) => {
  const [hoursRaw, minutesRaw] = time.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const now = new Date();
  now.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
  return now.toISOString();
};

function ShiftManager() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [change,setChange] = useState(true);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingShift, setEditingShift] = React.useState<Shift | null>(null);

  // State cho modal xem chi tiết
  const [viewShift, setViewShift] = useState<Shift | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  useEffect(() => {
    const fetchShifts = async () => {
        const res = await getShiftService();
        const rawShifts = res.data.data;
        const formattedShifts = rawShifts.map((shift: any) => ({
          id: shift.id,
          name: shift.name,
          start_time: formatDateToHHmm(shift.start_time),
          end_time: formatDateToHHmm(shift.end_time),
        }));
        
        setShifts(formattedShifts);      
    };
    fetchShifts();
  }, [change]);
 
  const openModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      form.setFieldsValue(shift);
    } else {
      setEditingShift(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Hàm mở modal xem chi tiết
  const openViewModal = (shift: Shift) => {
    setViewShift(shift);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await deteleShiftService(id.toString());
    setShifts(prev => prev.filter(s => s.id !== id));
    message.success('Đã xoá ca làm');
    setChange(!change);
  };
  const handleSubmit = async (values: any) => {
    const payload = {
      name: values.name,
      start_time: convertHHmmToISOString(values.start_time),
      end_time: convertHHmmToISOString(values.end_time),
    };

    if (editingShift) {
      try {
        await updateShiftService( payload, editingShift.id.toString());
            setShifts(prev =>
            prev.map(s => (s.id === editingShift.id ? { ...s, ...values } : s))
            );
            message.success('Đã cập nhật ca làm');
        setModalVisible(false);
        setChange(!change);
      } catch {
        message.error('Tên ca làm đã trùng');
      }
      return;
    }

      const res = await createShiftService(payload);
      const newShift = res.data.data;
      setShifts(prev => [
        ...prev,
        {
          id: newShift.id,
          name: newShift.name,
          start_time: formatDateToHHmm(newShift.start_time),
          end_time: formatDateToHHmm(newShift.end_time),
        },
      ]);
      message.success('Đã thêm ca làm');
      setChange(!change);
      setModalVisible(false);
  };

  const columns = [
    {
      title: 'Tên ca',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Shift, b: Shift) => a.name.localeCompare(b.name),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm tên ca"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Tìm
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </div>
      ),
      onFilter: (value: boolean | React.Key, record: Shift) =>
        record.name.toLowerCase().includes(String(value).toLowerCase()),
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'start_time',
      key: 'start_time',
      sorter: (a: Shift, b: Shift) => a.start_time.localeCompare(b.start_time),
    },
    {
      title: 'Giờ kết thúc',
      dataIndex: 'end_time',
      key: 'end_time',
      sorter: (a: Shift, b: Shift) => a.end_time.localeCompare(b.end_time),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Shift) => (
        <>
          <Button onClick={() => openViewModal(record)} size="small" style={{ marginRight: 8 }}><Eye size={15}/></Button>
          <Button onClick={() => openModal(record)} size="small"><PenLine size={15}/></Button>
          <Popconfirm title="Xoá?" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" className="ml-2"><Delete size={15}/></Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Quản Lý Ca Làm</Title>
      <Button type="primary" onClick={() => openModal()} className="mb-4">Thêm Ca Làm</Button>
      <Table dataSource={shifts} columns={columns} rowKey="id" bordered pagination={{ pageSize: 5 }} />

      <Modal
        title={editingShift ? 'Sửa Ca Làm' : 'Thêm Ca Làm'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên ca" rules={[{ required: true, message: 'Vui lòng nhập tên ca' }]}> 
            <Input placeholder="Nhập tên ca (ví dụ: Sáng)" />
          </Form.Item>
          <Form.Item name="start_time" label="Giờ bắt đầu" rules={[{ required: true, message: 'Vui lòng nhập giờ bắt đầu' }]}> 
            <Input placeholder="HH:mm (ví dụ: 07:00)" />
          </Form.Item>
          <Form.Item name="end_time" label="Giờ kết thúc" rules={[{ required: true, message: 'Vui lòng nhập giờ kết thúc' }]}> 
            <Input placeholder="HH:mm (ví dụ: 11:00)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thông tin Ca Làm"
        open={viewModalVisible}
        footer={null}
        onCancel={() => setViewModalVisible(false)}
      >
        
        {viewShift && (
         
          <div>
            <p><strong>Tên ca:</strong> {viewShift.name}</p>
            <p><strong>Giờ bắt đầu:</strong> {viewShift.start_time}</p>
            <p><strong>Giờ kết thúc:</strong> {viewShift.end_time}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ShiftManager;
