import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, message, TimePicker, Row, Col, Typography } from 'antd';
import dayjs from 'dayjs';
import { getAllAvailableSlotsService } from '../../services/appointment.service';
import { bookAppointmentService } from '../../services/appointment.service';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const QRBookAppointmentForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [clinics, setClinics] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    const fetchDoctorsAndSlots = async () => {
      try {
        const response = await getAllAvailableSlotsService();
        const slots = response.data || response.metadata || [];
        setAvailableSlots(slots);
        // Lấy danh sách bác sĩ và phòng khám từ slot
        const doctorMap = new Map();
        const clinicMap = new Map();
        slots.forEach((slot: any) => {
          if (slot.doctor_id && slot.doctor_name) doctorMap.set(slot.doctor_id, { id: slot.doctor_id, name: slot.doctor_name });
          if (slot.clinic_id && slot.clinic_name) clinicMap.set(slot.clinic_id, { id: slot.clinic_id, name: slot.clinic_name });
        });
        setDoctors(Array.from(doctorMap.values()));
        setClinics(Array.from(clinicMap.values()));
      } catch (err) {
        message.error('Không thể tải dữ liệu slot');
      }
    };
    fetchDoctorsAndSlots();
  }, []);

  // Khi chọn bác sĩ, lọc các phòng khám mà bác sĩ đó có slot
  const handleDoctorChange = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    // Lọc các phòng khám mà bác sĩ này có slot
    const clinicsOfDoctor = Array.from(
      new Map(
        availableSlots
          .filter((slot: any) => slot.doctor_id === doctorId && slot.is_available)
          .map((slot: any) => [slot.clinic_id, { id: slot.clinic_id, name: slot.clinic_name }])
      ).values()
    );
    setClinics(clinicsOfDoctor);
    setSelectedClinic(null);
    setAvailableDates([]);
    setAvailableTimes([]);
    form.setFieldsValue({ clinic_id: undefined, slot_date: undefined, start_time: undefined });
  };

  // Lọc slot tương lai
  const now = dayjs();
  const futureSlots = availableSlots.filter((slot: any) => {
    const slotDateTime = dayjs(slot.slot_date + ' ' + slot.start_time);
    return slotDateTime.isAfter(now);
  });

  // Group slot theo clinic, date (chỉ dùng futureSlots)
  const clinicsOfDoctor = selectedDoctor
    ? Array.from(
        new Map(
          futureSlots
            .filter((slot: any) => slot.doctor_id === selectedDoctor && slot.is_available)
            .map((slot: any) => [slot.clinic_id, { id: slot.clinic_id, name: slot.clinic_name }])
        ).values()
      )
    : [];
  const filteredSlots = selectedClinic
    ? futureSlots.filter(
        (slot: any) => slot.doctor_id === selectedDoctor && slot.clinic_id === selectedClinic && slot.is_available
      )
    : [];
  const slotsByDate = filteredSlots.reduce((acc: Record<string, any[]>, slot: any) => {
    const dateKey = dayjs(slot.slot_date).format('YYYY-MM-DD');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});
  const dateOptions = Object.keys(slotsByDate);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // Reset khi đổi clinic/doctor
  useEffect(() => {
    setSelectedDate(null);
    setSelectedSlot(null);
  }, [selectedClinic, selectedDoctor]);

  // Khi chọn ngày, lọc giờ khả dụng
  const handleDateChange = (date: any) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const filtered = availableSlots.filter(
      (slot: any) => slot.doctor_id === selectedDoctor && slot.clinic_id === selectedClinic && dayjs(slot.slot_date).format('YYYY-MM-DD') === dateStr && slot.is_available
    );
    setAvailableTimes(filtered.map((slot: any) => ({ value: slot.start_time, label: slot.start_time })));
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        doctor_id: selectedDoctor,
        clinic_id: selectedClinic,
        slot_date: selectedDate,
        start_time: selectedSlot?.start_time,
      };
      const res = await bookAppointmentService(payload);
      if (res.data) {
        message.success('Đặt lịch thành công!');
        form.resetFields();
        setSelectedDate(null);
        setSelectedSlot(null);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Đặt lịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Điền thông tin đặt lịch khám">
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}> <Input /> </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}> <Input /> </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}> <Select> <Option value="male">Nam</Option> <Option value="female">Nữ</Option> <Option value="other">Khác</Option> </Select> </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="date_of_birth" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}> <DatePicker className="w-full" /> </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="identity_number" label="Căn cước công dân" rules={[{ required: true, message: 'Vui lòng nhập CCCD' }]}> <Input /> </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}> <Input /> </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="doctor_id" label="Bác sĩ" rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}> <Select placeholder="Chọn bác sĩ" onChange={handleDoctorChange} showSearch optionFilterProp="children"> {doctors.map(doc => <Option key={doc.id} value={doc.id}>{doc.name}</Option>)} </Select> </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="clinic_id" label="Phòng khám" rules={[{ required: true, message: 'Vui lòng chọn phòng khám' }]}> <Select placeholder="Chọn phòng khám" onChange={setSelectedClinic} showSearch optionFilterProp="children" disabled={!selectedDoctor}> {clinicsOfDoctor.map(clinic => <Option key={clinic.id} value={clinic.id}>{clinic.name}</Option>)} </Select> </Form.Item>
          </Col>
        </Row>
        <Title level={5} className="!mb-4">Chọn ngày khám</Title>
        <div className="flex gap-3 items-center w-full overflow-x-auto mb-4">
          {selectedClinic && dateOptions.map(dateKey => {
            const dateObj = new Date(dateKey);
            const weekday = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
            const dateStr = dateObj.toLocaleDateString('vi-VN');
            return (
              <div
                key={dateKey}
                onClick={() => {
                  setSelectedDate(dateKey);
                  setSelectedSlot(null);
                }}
                className={`text-center py-2 px-4 rounded-lg cursor-pointer transition-colors ${selectedDate === dateKey
                  ? "bg-primary text-white"
                  : "border border-gray-200 hover:border-primary"
                  }`}
              >
                <Text className={selectedDate === dateKey ? "!text-white" : ""} strong>
                  {weekday.charAt(0).toUpperCase() + weekday.slice(1)}, {dateStr}
                </Text>
              </div>
            );
          })}
          {selectedClinic && dateOptions.length === 0 && (
            <Text type="secondary">Không có lịch cho phòng khám này</Text>
          )}
        </div>
        <Title level={5} className="!mb-4">Chọn giờ khám</Title>
        <div className="flex gap-3 items-center w-full overflow-x-auto mb-4">
          {selectedClinic && !selectedDate && <Text type="secondary">Vui lòng chọn ngày trước</Text>}
          {selectedClinic && selectedDate && slotsByDate[selectedDate]?.map(slot => {
            const startTime = new Date(slot.start_time).getUTCHours().toString().padStart(2, '0') + ':' +
              new Date(slot.start_time).getUTCMinutes().toString().padStart(2, '0');
            const endTime = new Date(slot.end_time).getUTCHours().toString().padStart(2, '0') + ':' +
              new Date(slot.end_time).getUTCMinutes().toString().padStart(2, '0');
            const isAvailable = slot.is_available;
            return (
              <Button
                key={slot.id}
                type={selectedSlot?.id === slot.id ? "primary" : "default"}
                onClick={() => isAvailable && setSelectedSlot(slot)}
                className={`rounded-full group ${!isAvailable ? 'cursor-not-allowed' : ''}`}
                disabled={!isAvailable}
                title={!isAvailable ? 'Đã được đặt' : ''}
              >
                <span>{startTime} ~ {endTime}</span>
                {!isAvailable && (
                  <span className="invisible group-hover:visible text-xs text-gray-500 ml-1">Đã đặt</span>
                )}
              </Button>
            );
          })}
          {selectedClinic && selectedDate && (!slotsByDate[selectedDate] || slotsByDate[selectedDate].length === 0) && (
            <Text type="secondary">Không có lịch cho ngày này</Text>
          )}
        </div>
        <Form.Item name="reason" label="Lý do khám"> <TextArea rows={3} placeholder="Nhập lý do khám" /> </Form.Item>
        <Form.Item name="note" label="Ghi chú"> <TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" /> </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-2" disabled={!selectedSlot}>Đặt lịch khám</Button>
      </Form>
    </Card>
  );
};

export default QRBookAppointmentForm; 