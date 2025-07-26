import React, { useEffect, useState } from "react";
import { Button, Form, Input, Card, Space, Typography, message } from "antd";
import { nurseRescheduleAppointmentService, getAllAvailableSlotsService } from "../../services/appointment.service";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;

interface AvailableSlot {
  id: number;
  doctor_id: number;
  clinic_id: number;
  clinic_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  doctor_name?: string;
  doctor_specialty?: string;
  doctor_bio?: string;
  doctor?: {
    id: number;
    full_name: string;
  };
}

interface Props {
  appointment: any;
  onSuccess: () => void;
}

const NurseRescheduleAppointment: React.FC<Props> = ({ appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        console.log('appointment:', appointment);
        const specialty = appointment.doctor_specialty;
        console.log('specialty:', specialty);
        if (!specialty) {
          message.error("Không xác định được chuyên môn");
          setLoading(false);
          return;
        }

        // Lấy tất cả slot trống theo chuyên môn
        const slotsRes = await getAllAvailableSlotsService();
        const allSlots = slotsRes.data || slotsRes.metadata || [];

        // Lọc chỉ lấy slot của cùng chuyên môn với lịch hẹn cũ và từ hôm nay trở đi
        const today = dayjs().startOf('day');
        const filteredSlots = allSlots.filter((slot: AvailableSlot) => {
          const slotDate = dayjs(slot.slot_date);
          return slot.doctor_specialty === specialty && slotDate.isSameOrAfter(today);
        });

        setSlots(filteredSlots);

        // Không tự động set phòng khám, để người dùng chọn
        setSelectedClinic(null);
      } catch (err) {
        console.error('Error fetching slots:', err);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [appointment]);

  const handleReschedule = async (values: any) => {
    if (selectedSlot) {
      try {
        const slotDate = dayjs(selectedSlot.slot_date).format("YYYY-MM-DD");
        const startTime = new Date(selectedSlot.start_time).getUTCHours().toString().padStart(2, '0') + ':' +
          new Date(selectedSlot.start_time).getUTCMinutes().toString().padStart(2, '0') + ':00';
        await nurseRescheduleAppointmentService({
          old_appointment_id: appointment.id,
          patient_id: appointment.patient_id || appointment.patientId,
          doctor_id: selectedSlot.doctor_id,
          clinic_id: selectedClinic,
          slot_date: slotDate,
          start_time: startTime,
          reason: values.reason,
          note: values.notes,
        });
        message.success("Đặt lại lịch khám thành công");
        onSuccess();
      } catch (error: any) {
        const apiMsg = error?.response?.data?.message || error?.message || "Đặt lại lịch khám thất bại";
        message.error(apiMsg);
      }
    }
  };

  // Lấy danh sách phòng khám từ slots (chỉ những phòng khám có slot cùng chuyên môn)
  const clinics = Array.from(
    new Map(
      slots
        .filter(slot => slot.clinic_id && slot.clinic_name && slot.doctor_specialty === appointment.doctor_specialty)
        .map(slot => [slot.clinic_id, { id: slot.clinic_id, name: slot.clinic_name }])
    ).values()
  );

  // Lọc slot theo phòng khám đã chọn
  const filteredSlots = selectedClinic
    ? slots.filter(slot => slot.clinic_id === selectedClinic)
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
    <div className="p-2">
      <Card className="mb-2" bodyStyle={{ padding: 12 }}>
        <Text strong>Thông tin lịch hẹn hiện tại:</Text>
        <div>
          <Text>Bệnh nhân: {appointment.patient_name}</Text>
          <br />
          <Text>Phòng khám: {appointment.clinic_name}</Text>
          <br />
          <Text>Ngày Đặt Lịch: {appointment.formatted_date}</Text>
          <br />
          <Text>Giờ khám: {appointment.formatted_time}</Text>
          <br />
          <Text>Bác sĩ: {appointment.doctor_name}</Text>
          <br />
          {appointment.doctor_specialty && (
            <>
              <Text>Chuyên khoa: {appointment.doctor_specialty}</Text>
              <br />
            </>
          )}
          {appointment.doctor_bio && (
            <>
              <Text>Tiểu sử: {appointment.doctor_bio}</Text>
              <br />
            </>
          )}
        </div>
      </Card>

      <Card title={<span className="font-semibold">Thông tin lịch khám mới</span>} className="mb-2" bodyStyle={{ padding: 12 }}>
        <Title level={5} className="!mb-2">Chọn phòng khám</Title>
        <div className="flex gap-2 items-center w-full overflow-x-auto mb-2">
          {clinics.length === 0 ? (
            <Text type="secondary">Không có phòng khám khả dụng</Text>
          ) : clinics.map(clinic => (
            <div
              key={clinic.id}
              onClick={() => {
                setSelectedClinic(clinic.id);
                setSelectedDate(null);
                setSelectedSlot(null);
              }}
              className={`text-center py-2 px-4 rounded-lg cursor-pointer transition-colors ${selectedClinic === clinic.id
                ? "bg-primary text-white"
                : "border border-gray-200 hover:border-primary"
                }`}
            >
              <Text className={selectedClinic === clinic.id ? "!text-white" : ""} strong>
                {clinic.name}
              </Text>
            </div>
          ))}
        </div>

        {clinics.length > 0 && (
          <>
            <Title level={5} className="!mb-2">Chọn Ngày Đặt Lịch</Title>
            <div className="flex gap-2 items-center w-full overflow-x-auto mb-2">
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
                <Text type="secondary">Không có lịch trống cho phòng khám này</Text>
              )}
            </div>

            <Title level={5} className="!mb-2">Chọn giờ khám</Title>
            <div className="flex flex-wrap gap-2 mb-2">
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
                    {startTime} ~ {endTime} <br />
                    <span className="text-xs text-gray-500">{slot.doctor?.full_name}</span>
                  </Button>
                );
              })}
              {selectedClinic && selectedDate && (!slotsByDate[selectedDate] || slotsByDate[selectedDate].length === 0) && (
                <Text type="secondary">Không có giờ trống cho ngày này</Text>
              )}
            </div>
          </>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleReschedule}
          autoComplete="off"
        >
          {selectedSlot && (
            <Card className="mb-2" bodyStyle={{ padding: 12, background: '#f6f8fa' }}>
              <Text strong>Thông tin bác sĩ mới:</Text>
              <div>
                <Text>Bác sĩ: {selectedSlot.doctor_name || selectedSlot.doctor?.full_name || appointment.doctor_name}</Text>
                <br />
                {selectedSlot.doctor_specialty && (
                  <>
                    <Text>Chuyên khoa: {selectedSlot.doctor_specialty}</Text>
                    <br />
                  </>
                )}
                {selectedSlot.doctor_bio && (
                  <>
                    <Text>Tiểu sử: {selectedSlot.doctor_bio}</Text>
                    <br />
                  </>
                )}
              </div>
            </Card>
          )}
          <Form.Item
            name="reason"
            label="Lý do khám"
            rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả lý do khám của bệnh nhân"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea
              rows={2}
              placeholder="Thông tin bổ sung (nếu có)"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                className="rounded-full px-8"
                disabled={!selectedSlot}
                loading={loading}
              >
                Đặt lại lịch khám
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NurseRescheduleAppointment; 