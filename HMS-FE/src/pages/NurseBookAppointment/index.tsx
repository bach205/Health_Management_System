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

const { Option } = Select;

interface BookAppointmentFormData {
  patientName: string;
  phoneNumber: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorId: string;
  symptoms: string;
}

const NurseBookAppointment: React.FC = () => {
  const [form] = Form.useForm();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch doctors list from API
    // This is a placeholder for demonstration
    setDoctors([
      { id: '1', name: 'Dr. John Doe', specialization: 'General Medicine' },
      { id: '2', name: 'Dr. Jane Smith', specialization: 'Cardiology' },
    ]);
  }, []);

  const onFinish = async (values: BookAppointmentFormData) => {
    try {
      setLoading(true);
      // TODO: Implement API call to save appointment
      console.log('Form values:', values);

      message.success('Appointment booked successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Card title="Book New Appointment" className="max-w-3xl mx-auto w-full">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="patientName"
                label="Patient Name"
                rules={[{ required: true, message: 'Please enter patient name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter patient name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="doctorId"
                label="Select Doctor"
                rules={[{ required: true, message: 'Please select a doctor' }]}
              >
                <Select placeholder="Select a doctor">
                  {doctors.map(doctor => (
                    <Option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="appointmentDate"
                label="Appointment Date"
                rules={[{ required: true, message: 'Please select appointment date' }]}
              >
                <DatePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appointmentTime"
                label="Appointment Time"
                rules={[{ required: true, message: 'Please select appointment time' }]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  minuteStep={30}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="Symptoms/Notes"
            rules={[{ required: true, message: 'Please enter symptoms or notes' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter symptoms or any additional notes" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full">
              Book Appointment
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NurseBookAppointment; 