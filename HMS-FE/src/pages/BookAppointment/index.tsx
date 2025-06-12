import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import RelatedDoctors from "../../components/RelatedDoctors";
import { Button, Form, Input, Card, Space, Typography } from "antd";

const { Title, Text } = Typography;

interface Doctor {
  _id: string;
  name: string;
  degree: string;
  speciality: string;
  experience: string;
  about: string;
  fees: number;
  image: string;
}

interface TimeSlot {
  datetime: Date;
  time: string;
}

const PatientBookAppointment: React.FC = () => {
  const [form] = Form.useForm();
  const { docId } = useParams<{ docId: string }>();
  const { doctors, currencySymbol } = useContext(AppContext);
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const [docInfo, setDocInfo] = useState<Doctor | null>(null);
  const [docSlots, setDocSlots] = useState<TimeSlot[][]>([]);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const [slotTime, setSlotTime] = useState<string>("");

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo || null);
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots: TimeSlot[] = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  const handleBookAppointment = (values: any) => {
    if (slotTime) {
      console.log("Đặt lịch hẹn với:", docInfo?.name, "vào lúc", slotTime);
      console.log("Thông tin:", values);
      // Implement booking logic here
    }
  };

  return (
    docInfo && (
      <div className="p-4">
        <Card className="mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <img
                className="w-full sm:w-72 rounded-lg object-cover"
                src={docInfo.image}
                alt={docInfo.name}
              />
            </div>
            <div className="flex-1">
              <Space direction="vertical" size="small" className="w-full">
                <Title level={4} className="!mb-0">
                  {docInfo.name}
                  <img className="w-5 inline-block ml-2" src={assets.verified_icon} alt="verified" />
                </Title>
                
                <Space size="small" className="flex-wrap">
                  <Text type="secondary">
                    {docInfo.degree} - {docInfo.speciality}
                  </Text>
                  <Button size="small" className="rounded-full">
                    {docInfo.experience}
                  </Button>
                </Space>

                <div className="mt-4">
                  <Title level={5} className="!mb-1">
                    Thông tin bác sĩ
                    <img src={assets.info_icon} alt="info" className="inline-block ml-2" />
                  </Title>
                  <Text type="secondary">{docInfo.about}</Text>
                </div>

                <Text className="mt-4">
                  Phí khám: <Text strong>{currencySymbol}{docInfo.fees}</Text>
                </Text>
              </Space>
            </div>
          </div>
        </Card>

        <Card title="Đặt lịch khám" className="mb-4">
          <Title level={5} className="!mb-4">Chọn thời gian khám</Title>
          
          <div className="flex gap-3 items-center w-full overflow-x-auto mb-4">
            {docSlots.map((item, index) => (
              <div
                onClick={() => setSlotIndex(index)}
                className={`text-center py-4 px-6 rounded-lg cursor-pointer transition-colors ${
                  slotIndex === index
                    ? "bg-primary text-white"
                    : "border border-gray-200 hover:border-primary"
                }`}
                key={index}
              >
                <Text className={slotIndex === index ? "!text-white" : ""} strong>
                  {item[0] && daysOfWeek[item[0].datetime.getDay()]}
                </Text>
                <br />
                <Text className={slotIndex === index ? "!text-white" : ""}>
                  {item[0] && item[0].datetime.getDate()}
                </Text>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {docSlots.length > 0 &&
              docSlots[slotIndex]?.map((item, index) => (
                <Button
                  key={index}
                  type={item.time === slotTime ? "primary" : "default"}
                  onClick={() => setSlotTime(item.time)}
                  className="rounded-full"
                >
                  {item.time.toLowerCase()}
                </Button>
              ))}
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
                disabled={!slotTime}
              >
                Đặt lịch khám
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Bác sĩ cùng chuyên khoa">
          <RelatedDoctors docId={docId} speciality={docInfo?.speciality || ''} />
        </Card>
      </div>
    )
  );
};

export default PatientBookAppointment;
