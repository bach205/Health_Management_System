import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, message, TimePicker, Row, Col, Typography, Modal } from 'antd';
import dayjs from 'dayjs';
import { bookAppointmentByQRService, getAllAvailableSlotsService, getAvailableSlots } from '../../services/appointment.service';
import { bookAppointmentService } from '../../services/appointment.service';
import { getClinics } from '../../services/clinic.service';

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
  const [successModal, setSuccessModal] = useState<{ visible: boolean, queueNumber?: string | number }>({ visible: false });

  useEffect(() => {
    const fetchDoctorsAndSlots = async () => {
      try {
        // Sử dụng getAvailableSlots với object rỗng để lấy tất cả slot còn trống
        const response = await getAvailableSlots({});
        const slots = response.data || response.metadata || [];
        setAvailableSlots(slots);
        console.log('All slots:', slots);
        // Lấy danh sách bác sĩ và phòng khám từ slot
        const doctorMap = new Map();
        slots.forEach((slot: any) => {
          if (slot.doctor_id && slot.doctor_name) doctorMap.set(slot.doctor_id, { id: slot.doctor_id, name: slot.doctor_name });
        });
        setDoctors(Array.from(doctorMap.values()));
        // Fetch clinics and setClinics
        const clinicsRes = await getClinics();
        // Use only clinicsRes.data
        const clinicsData = clinicsRes.data.metadata.clinics || [];
        setClinics(clinicsData.map((c: any) => ({ id: c.id, name: c.name })));
      } catch (err) {
        message.error('Không thể tải dữ liệu slot hoặc phòng khám');
      }
    };
    fetchDoctorsAndSlots();
  }, []);

  // Lọc slot tương lai
  const today = dayjs().startOf('day');
  const futureSlots = availableSlots.filter((slot: any) => {
    const slotDate = dayjs(slot.slot_date);
    return slotDate.isSameOrAfter(today);
  });

  // Khi chọn phòng khám, lọc danh sách bác sĩ có slot ở phòng khám đó
  const handleClinicChange = (clinicId: number) => {
    setSelectedClinic(clinicId);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    
    // Chỉ reset các trường liên quan đến việc chọn bác sĩ và slot
    const currentValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentValues,
      clinic_id: clinicId,
      doctor_id: undefined,
      slot_date: undefined,
      start_time: undefined
    });

    // Log dữ liệu để debug
    console.log('futureSlots:', futureSlots);
    console.log('Selected clinic:', clinicId, typeof clinicId);
    const doctorsOfClinic = Array.from(
      new Map(
        futureSlots
          .filter((slot: any) => Number(slot.clinic_id) === Number(clinicId) && slot.is_available)
          .map((slot: any) => [slot.doctor_id, { id: slot.doctor_id, name: slot.doctor_name }])
      ).values()
    );
    setDoctors(doctorsOfClinic as { id: number, name: string }[]);
  };

  // Khi chọn bác sĩ, chỉ reset các trường liên quan đến slot
  const handleDoctorChange = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    setSelectedDate(null);
    setSelectedSlot(null);
    
    // Chỉ reset các trường liên quan đến slot
    const currentValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentValues,
      doctor_id: doctorId,
      slot_date: undefined,
      start_time: undefined
    });
  };

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
  const handleDateSelect = (dateKey: string) => {
    setSelectedDate(dateKey);
    const filtered = availableSlots.filter(
      (slot: any) =>
        slot.doctor_id === selectedDoctor &&
        slot.clinic_id === selectedClinic &&
        dayjs(slot.slot_date).format('YYYY-MM-DD') === dateKey &&
        slot.is_available
    );
    setAvailableTimes(filtered.map((slot: any) => ({ value: slot.start_time, label: slot.start_time })));
    setSelectedDate(dateKey);
    setSelectedSlot(null);
    form.setFieldsValue({ slot_date: dateKey });
    form.resetFields(['start_time']);
  };

  // Khi chọn ngày từ UI (click), cập nhật state và form
  const handleDateClick = (dateKey: string) => {
    setSelectedDate(dateKey);
    setSelectedSlot(null);
    
    // Giữ lại các giá trị hiện tại và chỉ cập nhật slot_date
    const currentValues = form.getFieldsValue();
    form.setFieldsValue({
      ...currentValues,
      slot_date: dateKey,
      start_time: undefined
    });
  };

  // Khi chọn giờ khám (slot), cập nhật state và form
  const handleSlotClick = (slot: any) => {
    if (slot.is_available) {
      setSelectedSlot(slot);
      // Giữ lại tất cả các giá trị hiện tại và chỉ cập nhật start_time
      const currentValues = form.getFieldsValue();
      const startTime = new Date(slot.start_time).getUTCHours().toString().padStart(2, '0') + ':' +
        new Date(slot.start_time).getUTCMinutes().toString().padStart(2, '0');
      form.setFieldsValue({
        ...currentValues,
        start_time: startTime
      });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : undefined,
        clinic_id: Number(values.clinic_id),
        doctor_id: Number(values.doctor_id),
        start_time: values.start_time ? `${values.start_time}:00` : undefined
      };
      

      const res = await bookAppointmentByQRService(formData);
      console.log(res.data)
      message.success(res.data.message);
      if (res.data && res.data.queue_number) {
        
        setSuccessModal({ visible: true, queueNumber: res.data.queue_number });
        form.resetFields();
        setSelectedDate(null);
        setSelectedSlot(null);
        setSelectedDoctor(null);
        setSelectedClinic(null);
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
            <Form.Item name="full_name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="Số điện thoại" rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^0\d{9,10}$/, message: 'Số điện thoại phải bắt đầu bằng 0 và có 10-11 số' }
            ]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
              <Select placeholder="Chọn giới tính">
                <Option value="male">Nam</Option>
                <Option value="female">Nữ</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="date_of_birth" label="Ngày sinh" rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh' },
            ]}>
              <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Chọn ngày sinh" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="identity_number" label="Căn cước công dân" rules={[
              { required: true, message: 'Vui lòng nhập CCCD' },
              { pattern: /^\d{12}$/, message: 'CCCD phải đủ 12 số' }
            ]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="clinic_id" label="Phòng khám" rules={[{ required: false, message: 'Vui lòng chọn phòng khám' }]}>
              <Select placeholder="Chọn phòng khám" onChange={handleClinicChange} showSearch optionFilterProp="children">
                {clinics.map(clinic => <Option key={clinic.id} value={clinic.id}>{clinic.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="doctor_id" label="Bác sĩ" rules={[{ required: false, message: 'Vui lòng chọn bác sĩ' }]}>
              <Select placeholder="Chọn bác sĩ" onChange={handleDoctorChange} showSearch optionFilterProp="children" disabled={!selectedClinic}>
                {doctors.map(doc => <Option key={doc.id} value={doc.id}>{doc.name}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="slot_date" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="start_time" hidden>
          <Input />
        </Form.Item>
        <Title level={5} className="!mb-4">Chọn ngày khám</Title>
        <div className="flex gap-3 items-center w-full overflow-x-auto mb-4">
          {selectedClinic && dateOptions.map(dateKey => {
            const dateObj = new Date(dateKey);
            const weekday = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
            const dateStr = dateObj.toLocaleDateString('vi-VN');
            return (
              <div
                key={dateKey}
                onClick={() => handleDateClick(dateKey)}
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
                onClick={() => handleSlotClick(slot)}
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
        <Form.Item name="reason" label="Lý do khám">
          <TextArea rows={3} placeholder="Nhập lý do khám" />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-2" disabled={!selectedSlot}>Đặt lịch khám</Button>
      </Form>
      <Modal
        open={successModal.visible}
        onCancel={() => setSuccessModal({ visible: false })}
        footer={null}
        centered
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-green-600">Đặt lịch thành công!</h2>
          <div className="text-lg mb-2">Số thứ tự khám của bạn là:</div>
          <div className="text-4xl font-bold text-primary mb-4">{successModal.queueNumber}</div>
        </div>
      </Modal>
    </Card>
  );
};

export default QRBookAppointmentForm; 