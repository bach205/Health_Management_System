import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Card,
  message,
  TimePicker,
  Row,
  Col
} from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { getAllAvailableSlotsService, nurseBookAppointmentService } from '../../services/appointment.service';
import { getDoctors } from '../../services/doctor.service';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

interface Doctor {
  id: number;
  name: string;
  clinics: {
    id: number;
    name: string;
  }[];
}

interface TimeSlot {
  value: string;
  label: string;
}

interface AvailableSlot {
  id: number;
  doctor_id: number;
  clinic_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  doctor_name: string;
  doctor_role: string;
  clinic_name: string;
}

const QRBookAppointmentForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [clinics, setClinics] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    const fetchDoctorsAndSlots = async () => {
      try {

        const response = await getAllAvailableSlotsService();

        if (response.success) {
          setAvailableSlots(response.data);

          // Build doctors with clinics array
          const doctorsMap = new Map<number, Doctor>();
          const clinicsMap = new Map<number, string>();

          response.data.forEach((slot: AvailableSlot) => {
            // Add to doctors map
            if (!doctorsMap.has(slot.doctor_id)) {
              doctorsMap.set(slot.doctor_id, {
                id: slot.doctor_id,
                name: slot.doctor_name,
                clinics: [{ id: slot.clinic_id, name: slot.clinic_name }]
              });
            } else {
              const doctor = doctorsMap.get(slot.doctor_id)!;
              if (!doctor.clinics.some(c => c.id === slot.clinic_id)) {
                doctor.clinics.push({ id: slot.clinic_id, name: slot.clinic_name });
              }
            }

            // Add to clinics map
            if (!clinicsMap.has(slot.clinic_id)) {
              clinicsMap.set(slot.clinic_id, slot.clinic_name);
            }
          });
          setDoctors(Array.from(doctorsMap.values()));

          setClinics(Array.from(clinicsMap.entries()).map(([id, name]) => ({ id, name })));
        }
      } catch (error) {
        message.error('Failed to fetch doctors and slots');
      }
    };
    fetchDoctorsAndSlots();
  }, []);

  // Update available clinics and dates when doctor is selected
  const handleDoctorChange = (doctorId: number) => {
    setSelectedDoctor(doctorId);
    setSelectedClinic(null);

    // Reset form fields
    form.setFieldsValue({
      clinic_id: null,
      appointment_date: null,
      appointment_time: null
    });
  };

  // Update available dates and times when clinic is selected
  const handleClinicChange = (clinicId: number) => {
    setSelectedClinic(clinicId);
    const doctorSlots = availableSlots.filter(slot =>
      slot.doctor_id === selectedDoctor &&
      slot.clinic_id === clinicId
    );

    // Get unique dates
    const dates = Array.from(new Set(doctorSlots.map(slot =>
      dayjs(slot.slot_date).format('YYYY-MM-DD')
    )));
    setAvailableDates(dates);

    // Reset form fields
    form.setFieldsValue({
      appointment_date: null,
      appointment_time: null
    });
  };

  // Update available times when date is selected
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (!selectedClinic || !date) return;
    const selectedDate = dayjs(date).format('YYYY-MM-DD');
    const times = availableSlots
      .filter(slot =>
        slot.doctor_id === selectedDoctor &&
        slot.clinic_id === selectedClinic &&
        dayjs(slot.slot_date).format('YYYY-MM-DD') === selectedDate
      )
      .map(slot => ({
        value: dayjs.utc(slot.start_time).format('HH:mm:ss'),
        label: `${dayjs.utc(slot.start_time).format('HH:mm')} - ${dayjs.utc(slot.end_time).format('HH:mm')}`
      }));
    console.log(selectedDate)
    console.log(selectedDoctor, selectedClinic);
    setAvailableTimes(times);

    // Reset time field
    form.setFieldsValue({
      appointment_time: null
    });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await nurseBookAppointmentService({
        ...values,
        doctor_id: selectedDoctor,
        clinic_id: selectedClinic,
        appointment_date: dayjs(values.appointment_date).format('YYYY-MM-DD'),
        appointment_time: values.appointment_time // Ensure HH:mm:ss format
      });

      if (response.success) {
        message.success('Đặt lịch thành công');
        // navigate('/nurse/appointments');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đặt lịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Card title="Đặt lịch khám bằng QR" className="max-w-3xl mx-auto w-full">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          {/* Thông tin bệnh nhân */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="patientName"
                label="Tên bệnh nhân"
                rules={[{ required: true, message: 'Vui lòng nhập tên bệnh nhân' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập tên bệnh nhân" />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^\d{10}$/, message: 'Số điện thoại không hợp lệ' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng chọn bác sĩ' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          {/* <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row> */}

          {/* Thông tin lịch hẹn */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="doctor_id"
                label="Bác sĩ"
                rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
              >
                <Select
                  placeholder="Chọn bác sĩ"
                  onChange={handleDoctorChange}
                >
                  {doctors.map(doctor => (
                    <Option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="clinic_id"
                label="Phòng khám"
                rules={[{ required: true, message: 'Vui lòng chọn phòng khám' }]}
              >
                <Select
                  placeholder="Chọn phòng khám"
                  onChange={handleClinicChange}
                  disabled={!selectedDoctor}
                >
                  {(() => {
                    if (!selectedDoctor) return null;
                    const doctor = doctors.find(d => d.id === selectedDoctor);
                    return doctor?.clinics.map(clinic => (
                      <Option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </Option>
                    ));
                  })()}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="appointment_date"
                label="Ngày Đặt Lịch"
                rules={[{ required: true, message: 'Vui lòng chọn Ngày Đặt Lịch' }]}
              >
                <DatePicker
                  className="w-full"
                  disabledDate={(current) => {
                    return !availableDates.includes(dayjs(current).format('YYYY-MM-DD'));
                  }}
                  onChange={handleDateChange}
                  disabled={!selectedClinic}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appointment_time"
                label="Giờ khám"
                rules={[{ required: true, message: 'Vui lòng chọn giờ khám' }]}
              >
                <Select
                  placeholder="Chọn khung giờ"
                  disabled={!form.getFieldValue('appointment_date')}
                >
                  {availableTimes.map(time => (
                    <Option key={time.value} value={time.value}>
                      {time.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="Lý do khám"
            rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do khám" />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              Đặt lịch khám
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default QRBookAppointmentForm;