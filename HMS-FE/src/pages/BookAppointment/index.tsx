import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import RelatedDoctors from "../../components/RelatedDoctors";
import { Button, Form, Input, Card, Space, Typography, message } from "antd";
import { bookAppointmentService, getAvailableTimeSlotsService } from "../../services/appointment.service";
import { getDoctorById } from "../../services/doctor.service";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { specialtyOptions } from "../../constants/user.const";
import FeedbackDoctorComments from "../../components/feedback/FeedbackDoctorComments";
dayjs.extend(isSameOrAfter);

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
        const allSlots = data.metadata || [];

        // Lọc chỉ lấy slot từ hôm nay trở đi
        const today = dayjs().startOf('day');
        const filteredSlots = allSlots.filter((slot: AvailableSlot) => {
          const slotDate = dayjs(slot.slot_date);
          return slotDate.isSameOrAfter(today);
        });

        setSlots(filteredSlots);
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
          setSelectedSlot(null);
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
            {
              doctor?.metadata?.avatar && (
                <img
                  className="w-full sm:w-72 rounded-lg object-cover"
                  src={doctor?.metadata?.avatar}
                  alt={doctor?.full_name}
                />
              )
            }
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
                <Text type="secondary">Chuyên khoa: {specialtyOptions.find(item => item.value === doctor.metadata.doctor.specialty)?.label || "Không xác định"}</Text>
              )}
              {doctor?.metadata?.doctor?.bio && (
                <Text type="secondary">Tiểu sử: {doctor.metadata.doctor.bio}</Text>
              )}

              {doctor?.metadata?.doctor?.price && (
                <Text type="secondary" ><b>Giá khám:</b> {doctor.metadata.doctor.price}đ</Text>

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
              className={`text-center py-4 px-6 rounded-lg cursor-pointer transition-colors ${selectedClinic === clinic.id
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
        <Title level={5} className="!mb-4">Chọn Ngày Đặt Lịch</Title>
        <div className="flex gap-3 items-center w-full overflow-x-auto mb-4">
          {!selectedClinic && <Text type="secondary">Vui lòng chọn phòng khám trước</Text>}
          {selectedClinic && dateOptions.map(dateKey => {
            const dateObj = new Date(dateKey);
            const weekday = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
            const dateStr = dateObj.toLocaleDateString('vi-VN');

            // if (dayjs(dateKey).isBefore(dayjs(), 'day')) {
            //   return null; // Nếu Ngày Đặt Lịch đã qua, không hiển thị
            // }

            return (
              <div
                key={dateKey}
                onClick={() => {
                  setSelectedDate(dateKey);
                  setSelectedSlot(null);
                }}
                className={`text-center py-4 px-6 rounded-lg cursor-pointer transition-colors ${selectedDate === dateKey
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
        <div className="flex flex-wrap gap-3 mb-6">
          {!selectedClinic && <Text type="secondary">Vui lòng chọn phòng khám trước</Text>}
          {selectedClinic && !selectedDate && <Text type="secondary">Vui lòng chọn ngày trước</Text>}
          {selectedClinic && selectedDate && slotsByDate[selectedDate]
            ?.filter((item) => {
              if (!item.start_time) return false;
              const now = new Date();
              const slotDate = new Date(item.slot_date);
              // So sánh ngày theo UTC
              if (
                slotDate.getUTCFullYear() === now.getUTCFullYear() &&
                slotDate.getUTCMonth() === now.getUTCMonth() &&
                slotDate.getUTCDate() === now.getUTCDate()
              ) {
                // slot hôm nay, chỉ hiện nếu giờ bắt đầu > giờ hiện tại
                const slotStart = new Date(item.start_time);
                return slotStart.getUTCHours() >= now.getHours() ||
                  (slotStart.getUTCHours() === now.getHours() && slotStart.getUTCMinutes() > now.getMinutes());
              }
              // slot ngày khác, luôn hiện
              return true;
            })
            .map(slot => {
              const startTime = new Date(slot.start_time).getUTCHours().toString().padStart(2, '0') + ':' +
                new Date(slot.start_time).getUTCMinutes().toString().padStart(2, '0');
              const endTime = new Date(slot.end_time).getUTCHours().toString().padStart(2, '0') + ':' +
                new Date(slot.end_time).getUTCMinutes().toString().padStart(2, '0');

              // Kiểm tra slot có còn trống không
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
          {selectedClinic && selectedDate && (!slotsByDate[selectedDate] ||
            slotsByDate[selectedDate]
              ?.filter((item) => {
                if (!item.start_time) return false;
                const now = new Date();
                const slotDate = new Date(item.slot_date);
                // So sánh ngày theo UTC
                if (
                  slotDate.getUTCFullYear() === now.getUTCFullYear() &&
                  slotDate.getUTCMonth() === now.getUTCMonth() &&
                  slotDate.getUTCDate() === now.getUTCDate()
                ) {
                  // slot hôm nay, chỉ hiện nếu giờ bắt đầu > giờ hiện tại
                  const slotStart = new Date(item.start_time);
                  return slotStart.getUTCHours() >= now.getHours() ||
                    (slotStart.getUTCHours() === now.getHours() && slotStart.getUTCMinutes() > now.getMinutes());
                }
                // slot ngày khác, luôn hiện
                return true;
              }).length === 0) && (
              <Text type="secondary">Không có lịch cho ngày này</Text>
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
              placeholder="Thông tin bổ sung"
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
      {/* 
      <Card title="Bác sĩ cùng chuyên khoa">
        <RelatedDoctors docId={docId} speciality={""} />
      </Card> */}
      <FeedbackDoctorComments doctorId={Number(docId)} />
    </div>
  );
};

export default PatientBookAppointment;
