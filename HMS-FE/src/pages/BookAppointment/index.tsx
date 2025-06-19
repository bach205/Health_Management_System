import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import RelatedDoctors from "../../components/RelatedDoctors";
import { Button, Form, Input, Card, Space, Typography, message } from "antd";
import { bookAppointmentService, getAvailableTimeSlotsService } from "../../services/appointment.service";
import { getDoctorById } from "../../services/doctor.service";
import dayjs from "dayjs";
const { Title, Text } = Typography;

interface AvailableSlot {
  id: number;
  doctor_id: number;
  clinic_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  doctor: {
    id: number;
    full_name: string;
    speciality: string;
    bio: string;
  };
  clinic: {
    id: number;
    name: string;
  };
}

const PatientBookAppointment: React.FC = () => {
  const [form] = Form.useForm();
  const { docId } = useParams<{ docId: string }>();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        if (!docId) {
          throw new Error("Missing doctor ID");
        }
        const data = await getAvailableTimeSlotsService(docId);
        
        console.log(data);
        setSlots(data.metadata || []);
      } catch (err) {
        message.error("Không thể tải lịch khám");
      } finally {
        setLoading(false);
      }
    };
    if (docId) fetchSlots();
  }, [docId, success]);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (docId) {
        try {
          const res = await getDoctorById(Number(docId));
          setDoctor(res.data);
          console.log('Doctor API:', res.data);
        } catch (err) {
          message.error('Không thể tải thông tin bác sĩ');
        }
      }
    };
    fetchDoctor();
  }, [docId]);

  const handleBookAppointment = async (values: any) => {
    if (selectedSlot) {
      try {
        const patientId = localStorage.getItem("user");
        const slotDate = dayjs(selectedSlot.slot_date).format("YYYY-MM-DD");
        const startTime = new Date(selectedSlot.start_time).getUTCHours().toString().padStart(2, '0') + ':' + 
                          new Date(selectedSlot.start_time).getUTCMinutes().toString().padStart(2, '0') + ':00';
        const res = await bookAppointmentService({
          patient_id: JSON.parse(patientId || "").id,
          doctor_id: docId,
          clinic_id: selectedClinic,
          slot_date: slotDate,
          start_time: startTime,
          reason: values.symptoms,
          note: values.notes,
        });
        if (res.status === 201) {
          message.success("Đặt lịch khám thành công");
          setSuccess(!success);
          form.resetFields();
        }
      } catch (error: any) {
        let apiMsg = error?.response?.data?.message || error?.message || "Đặt lịch khám thất bại";
        if (apiMsg && apiMsg.startsWith('Vui lòng cập nhật đầy đủ thông tin')) {
          apiMsg = 'Vui lòng nhập đủ thông tin cá nhân trước khi đặt lịch khám';
        }
        message.error(apiMsg);
      }
    }
  };

  // Lấy danh sách phòng khám từ slots
  const clinics = Array.from(
    new Map(slots.map(slot => [slot.clinic.id, slot.clinic])).values()
  );

  // Lọc slot theo phòng khám đã chọn
  const filteredSlots = selectedClinic
    ? slots.filter(slot => slot.clinic.id === selectedClinic)
    : [];

  // Group lại filteredSlots theo ngày
  const slotsByDate = filteredSlots.reduce((acc, slot) => {
    const dateKey = slot.slot_date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  const dateOptions = Object.keys(slotsByDate);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="w-full sm:w-72 rounded-lg object-cover"
              src={assets.profile_pic}
              alt={doctor?.full_name}
            />
          </div>
          <div className="flex-1">
            <Space direction="vertical" size="small" className="w-full">
              <Title level={4} className="!mb-0">
                {doctor?.metadata?.full_name}
                <img className="w-5 inline-block ml-2" src={assets.verified_icon} alt="verified" />
              </Title>
              <Space size="small" className="flex-wrap">
                <Text type="secondary">
                  Phòng khám: {clinics.map(item => item.name).join(", ")}
                </Text>
              </Space>
              {doctor?.metadata?.doctor?.specialty && (
                <Text type="secondary">Chuyên khoa: {doctor.metadata.doctor.specialty}</Text>
              )}
              {doctor?.metadata?.doctor?.bio && (
                <Text type="secondary">Tiểu sử: {doctor.metadata.doctor.bio}</Text>
              )}
            </Space>
          </div>
        </div>
      </Card>

      <Card title="Đặt lịch khám" className="mb-4">
        <Title level={5} className="!mb-4">Chọn phòng khám</Title>
        <div className="flex gap-3 items-center w-full overflow-x-auto mb-4">
          {clinics.map(clinic => (
            <div
              key={clinic.id}
              onClick={() => {
                setSelectedClinic(clinic.id);
                setSelectedDate(null);
                setSelectedSlot(null);
              }}
              className={`text-center py-4 px-6 rounded-lg cursor-pointer transition-colors ${
                selectedClinic === clinic.id
                  ? "bg-primary text-white"
                  : "border border-gray-200 hover:border-primary"
              }`}
            >
              <Text className={selectedClinic === clinic.id ? "!text-white" : ""} strong>
                {clinic.name}
              </Text>
            </div>
          ))}
          {clinics.length === 0 && (
            <Text type="secondary">Không có phòng khám khả dụng</Text>
          )}
        </div>
        <Title level={5} className="!mb-4">Chọn ngày khám</Title>
        <div className="flex gap-3 items-center w-full overflow-x-auto mb-4">
          {!selectedClinic && <Text type="secondary">Vui lòng chọn phòng khám trước</Text>}
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
                className={`text-center py-4 px-6 rounded-lg cursor-pointer transition-colors ${
                  selectedDate === dateKey
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
            <Text type="secondary">Không có lịch trống cho phòng khám này</Text>
          )}
        </div>
        <Title level={5} className="!mb-4">Chọn giờ khám</Title>
        <div className="flex flex-wrap gap-3 mb-6">
          {!selectedClinic && <Text type="secondary">Vui lòng chọn phòng khám trước</Text>}
          {selectedClinic && !selectedDate && <Text type="secondary">Vui lòng chọn ngày trước</Text>}
          {selectedClinic && selectedDate && slotsByDate[selectedDate]?.map(slot => {
            const startTime = new Date(slot.start_time).getUTCHours().toString().padStart(2, '0') + ':' + 
                            new Date(slot.start_time).getUTCMinutes().toString().padStart(2, '0');
            const endTime = new Date(slot.end_time).getUTCHours().toString().padStart(2, '0') + ':' + 
                          new Date(slot.end_time).getUTCMinutes().toString().padStart(2, '0');
            return (
              <Button
                key={slot.id}
                type={selectedSlot?.id === slot.id ? "primary" : "default"}
                onClick={() => setSelectedSlot(slot)}
                className="rounded-full"
              >
                {startTime} ~ {endTime}
              </Button>
            );
          })}
          {selectedClinic && selectedDate && (!slotsByDate[selectedDate] || slotsByDate[selectedDate].length === 0) && (
            <Text type="secondary">Không có giờ trống cho ngày này</Text>
          )}
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBookAppointment}
          autoComplete="off"
        >
          <Form.Item
            name="symptoms"
            label="Triệu chứng"
            rules={[{ required: true, message: 'Vui lòng nhập triệu chứng' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Mô tả các triệu chứng của bạn"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Thông tin bổ sung (nếu có)"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-full px-8"
              disabled={!selectedSlot}
              loading={loading}
            >
              Đặt lịch khám
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Bác sĩ cùng chuyên khoa">
        <RelatedDoctors docId={docId} speciality={""} />
      </Card>
    </div>
  );
};

export default PatientBookAppointment;
