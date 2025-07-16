import { Modal, Form, Input, Button, Checkbox, Flex, InputNumber, Popconfirm, Select, Space, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import mainRequest from "../../../api/mainRequest";
import { Delete, Edit } from "lucide-react";
import { useMedicineList } from "../../../hooks/useMedicineList";
import type { IMedicine } from "../../../types/index.type";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");
import { bookAppointmentService, getAvailableTimeSlotsService } from "../../../services/appointment.service";
import { PushANotification } from "../../../api/notification";
interface ExaminationRecordModalProps {
  appointment_id: number,
  open: boolean;
  onClose: () => void;
  patient_id: number;
  clinic_id: number;
  doctor_id?: number;
  onSuccess?: () => void;
}


const DoctorExaminationRecordModal = ({
  appointment_id,
  open,
  onClose,
  patient_id,
  clinic_id,
  doctor_id,
  onSuccess,
}: ExaminationRecordModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [slotMap, setSlotMap] = useState<Record<string, any[]>>({});
  const [clinics, setClinics] = useState<any[]>([]);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, any[]>>({});
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [isFollowUp, setIsFollowUp] = useState<boolean>(false);

  const [medicinesAdded, setMedicinesAdded] = useState<IMedicine[]>([]);
  const [isCreate, setIsCreate] = useState(true);
  const [medicineVisible, setMedicineVisible] = useState(false);
  const [optionMedicines, setOptionMedicines] = useState<any[]>([]);

  const [selectedMedicine, setSelectedMedicine] = useState<IMedicine | null>(null);
  const { medicines } = useMedicineList();

  // Fetch slot theo doctor
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor_id) return;
      try {
        const res = await getAvailableTimeSlotsService(doctor_id.toString());
        const all = res.metadata || [];

        const today = dayjs().startOf("day");
        const available = all.filter((slot: any) =>
          dayjs(slot.slot_date).isSameOrAfter(today) && slot.is_available
        );

        setSlots(available);

        // Group phòng khám từ slot
        const clinicMap = new Map<number, any>();
        available.forEach((slot: any) => {
          if (slot.clinic) clinicMap.set(slot.clinic.id, slot.clinic);
        });
        setClinics(Array.from(clinicMap.values()));

        // Group slot theo ngày (lọc theo clinic khi đã chọn)
        const groupedByDate: Record<string, any[]> = {};
        available.forEach((slot: any) => {
          if (selectedClinic && slot.clinic_id !== selectedClinic) return;
          if (!groupedByDate[slot.slot_date]) groupedByDate[slot.slot_date] = [];
          groupedByDate[slot.slot_date].push(slot);
        });

        setSlotsByDate(groupedByDate);
      } catch (err) {
        toast.error("Không thể tải lịch khám");
      }
    };
    if (open) fetchSlots();
  }, [open, doctor_id, selectedClinic]);

  const handleDateChange = (date: any, dateStr: string) => {
    setSelectedDate(dateStr);
    setFilteredSlots(slotMap[dateStr] || []);
    setSelectedSlotId(null);
  };

  useEffect(() => {
    if (medicines) {
      setOptionMedicines(medicines.map((item, index) => ({
        label: `${item.name} `,
        value: item.id,
      })));
    }
  }, [medicines]);



  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const selectedSlot = slots.find(s => s.id === selectedSlotId);

      await mainRequest.post("/api/v1/examination-record", {
        patient_id,
        doctor_id,
        clinic_id,
        result: values.result,
        note: values.note ?? "",
        prescription_items: medicinesAdded.map((med) => ({
          medicine_id: med.id,
          note: med.note ?? null,
          dosage: med.dosage ?? null,
        }))
      });

      if (isFollowUp && selectedSlot) {

        const startTime = new Date(selectedSlot.start_time).getUTCHours().toString().padStart(2, '0') + ':' +
          new Date(selectedSlot.start_time).getUTCMinutes().toString().padStart(2, '0') + ':00';
        const appointmentPayload = {
          patient_id,
          doctor_id,
          clinic_id: selectedSlot.clinic_id,
          slot_date: dayjs(selectedSlot.slot_date).format("YYYY-MM-DD"),
          start_time: startTime,
          reason: "Tái khám",
          note: "",
        };

        // const res = await mainRequest.post("/api/v1/appointments", appointmentPayload);
        const res = await bookAppointmentService(appointmentPayload);
        if (res.status !== 201) throw new Error("Đặt lịch tái khám thất bại");
      }

      toast.success("Tạo hồ sơ khám thành công!");
      handleSetIsFollowUp(false)
      handleSetMedicineVisible(false);
      form.resetFields();
      setSelectedDate(null);
      setSelectedSlotId(null);
      onClose();
      onSuccess?.();
      //fix_here
      PushANotification({ message: `Bạn đã nhận được kết quả khám bệnh từ bác sĩ`, userId: patient_id })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const handleSetIsFollowUp = (checked: boolean) => {
    setIsFollowUp(checked);
    if (!checked) {
      setSelectedClinic(null);
      setSelectedDate(null);
      setSelectedSlotId(null);
    }
  };

  const handleAddMedicine = () => {
    if (selectedMedicine) {
      const frequency = selectedMedicine.frequencyAmount && selectedMedicine.frequencyUnit
        ? `${selectedMedicine.frequencyAmount} lần/${selectedMedicine.frequencyUnit}`
        : undefined;

      const dosage = selectedMedicine.dosageAmount && selectedMedicine.dosageUnit
        ? `${selectedMedicine.dosageAmount} ${selectedMedicine.dosageUnit}`
        : undefined;

      const newItem = {
        id: selectedMedicine.id,
        name: selectedMedicine.name,
        dosage,
        frequency,
        note: selectedMedicine.note,
      };

      const index = medicinesAdded.findIndex((item) => item.id === selectedMedicine.id);
      const newList = [...medicinesAdded];


      if (index !== -1) newList.splice(index, 1);
      newList.unshift(newItem);

      setMedicinesAdded(newList);
      setSelectedMedicine(null);
      setIsCreate(true);
    }
  };
  const clearsMedicine = () => {
    setSelectedMedicine(null);
    setIsCreate(true);
  };

  const handleSetMedicineVisible = (value: boolean) => {

    setMedicineVisible(value);
    if (!value) {
      setMedicinesAdded([]);
      clearsMedicine();

    }
  };



  const handleRemoveMedicine = (record: any) => {
    const newList = medicinesAdded.filter((item) => item.id !== record.id);
    setMedicinesAdded(newList);
  };

  console.log("selectec medicine", selectedMedicine);

  return (
    <Modal
      title="Tạo hồ sơ khám"
      open={open}
      onCancel={() => {
        form.resetFields();
        setSelectedDate(null);
        setSelectedSlotId(null);
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Lưu hồ sơ"
      cancelText="Hủy"
      centered
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="pt-2">
        <Form.Item
          label="Kết quả khám chuyên khoa"
          name="result"
          rules={[{ required: true, message: "Vui lòng nhập kết quả khám" }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập kết quả khám..." />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea rows={3} placeholder="Nhập ghi chú..." />
        </Form.Item>


        <Form.Item
          layout="horizontal"

          label="Hẹn tái khám"
          tooltip="Nếu chọn, bạn có thể đặt lịch tái khám cho bệnh nhân"

        >
          <Checkbox
            checked={isFollowUp}
            onChange={e => handleSetIsFollowUp(e.target.checked)}
          >
          </Checkbox>
        </Form.Item>
        {/* Chọn phòng khám */}
        {
          isFollowUp && (
            <>
              <Form.Item label="Chọn phòng khám">
                <div className="flex gap-2 flex-wrap">
                  {clinics.map(clinic => (
                    <Button
                      key={clinic.id}
                      type={selectedClinic === clinic.id ? "primary" : "default"}
                      onClick={() => {
                        setSelectedClinic(clinic.id);
                        setSelectedDate(null);
                        setSelectedSlotId(null);
                      }}
                    >
                      {clinic.name}
                    </Button>
                  ))}
                </div>
              </Form.Item>

              {/* Chọn ngày khám */}
              {selectedClinic && (
                <Form.Item label="Chọn ngày tái khám">
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(slotsByDate).map(date => {
                      const weekday = dayjs(date).locale('vi').format("dddd");
                      const dateStr = dayjs(date).format("DD/MM/YYYY");
                      return (
                        <Button
                          key={date}
                          type={selectedDate === date ? "primary" : "default"}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlotId(null);
                          }}
                        >
                          {`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dateStr}`}
                        </Button>
                      );
                    })}
                  </div>
                </Form.Item>
              )}

              {/* Chọn giờ khám */}
              {selectedClinic && selectedDate && (
                <Form.Item label="Chọn giờ tái khám">
                  <div className="flex gap-2 flex-wrap">
                    {(slotsByDate[selectedDate] || []).map(slot => {
                      const start = dayjs(slot.start_time).format("HH:mm");
                      const end = dayjs(slot.end_time).format("HH:mm");
                      return (
                        <Button
                          key={slot.id}
                          type={selectedSlotId === slot.id ? "primary" : "default"}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          {start} ~ {end}
                        </Button>
                      );
                    })}
                  </div>
                </Form.Item>
              )}
            </>
          )
        }


        <Space size={16}>
          <Form.Item
            layout="horizontal"
            label="Thêm đơn thuốc"
            tooltip="Nếu chọn, hồ sơ khám tổng quát có thêm đơn thuốc"
            initialValue={medicineVisible}
          >
            <Checkbox checked={medicineVisible} onChange={(e) => handleSetMedicineVisible(e.target.checked)} />
          </Form.Item>
        </Space>

        {
          medicineVisible && (
            <>
              <Form.Item label="Đơn thuốc" layout="horizontal">
                {/* <Flex wrap="wrap" gap={8}> */}
                <Select showSearch
                  style={{ width: 200 }}
                  placeholder="Chọn thuốc"
                  options={optionMedicines}
                  value={selectedMedicine?.id}
                  onChange={(_, option: any) => {
                    const med = medicines.find((m) => m.id === option.value);
                    if (med) {
                      setSelectedMedicine({
                        ...med,
                        dosage: "",
                        frequency: "",
                        note: "",
                      });
                      setIsCreate(true);
                    }
                  }}
                  disabled={!isCreate}
                />
              </Form.Item>
              {
                selectedMedicine && (
                  <>
                    <Form.Item label="Liều dùng" layout="horizontal">
                      <Flex className="w-full" gap={4} style={{ flexWrap: 'wrap' }}>
                        <Flex gap={4} style={{ flex: 1 }}>
                          <InputNumber
                            style={{ width: '50%' }}

                            min={0}
                            placeholder="Liều"
                            value={selectedMedicine?.dosageAmount}
                            onChange={(value) =>
                              setSelectedMedicine({ ...selectedMedicine!, dosageAmount: value || 1 })
                            }
                          />
                          <Select
                            style={{ width: '50%' }}

                            placeholder="Đơn vị"
                            options={["viên", "vỉ", "lọ", "giọt"].map((unit) => ({
                              label: unit,
                              value: unit,
                            }))}
                            value={selectedMedicine?.dosageUnit}
                            onChange={(value) =>
                              setSelectedMedicine({ ...selectedMedicine!, dosageUnit: value })
                            }
                          />

                        </Flex>

                      </Flex>

                    </Form.Item>
                    <Form.Item label="Tần suất" layout="horizontal">
                      <Flex gap={4} style={{ flex: 1 }}>
                        <InputNumber
                          min={1}
                          placeholder="Số lần"
                          value={selectedMedicine?.frequencyAmount}
                          onChange={(value) =>
                            setSelectedMedicine({ ...selectedMedicine!, frequencyAmount: value || 1 })
                          }
                          style={{ width: '50%' }}
                        />
                        <Select
                          placeholder="Khoảng thời gian"
                          options={["ngày", "tuần", "tháng"].map((unit) => ({
                            label: unit,
                            value: unit,
                          }))}
                          value={selectedMedicine?.frequencyUnit}
                          onChange={(value) =>
                            setSelectedMedicine({ ...selectedMedicine!, frequencyUnit: value })
                          }
                          style={{ width: '50%' }}
                        />
                      </Flex>
                    </Form.Item>
                    <Form.Item label="Ghi chú" layout="horizontal">

                      {/* //ghi chú */}
                      <TextArea placeholder="Ghi chú (VD: uống sau khi ăn)"
                        value={selectedMedicine?.note}
                        onChange={(e) =>
                          setSelectedMedicine({ ...selectedMedicine!, note: e.target.value })
                        }
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      className="mb-2"
                      onClick={handleAddMedicine}
                      disabled={!selectedMedicine}
                    >
                      {isCreate ? "Thêm" : "Cập nhật"}
                    </Button>

                  </>
                )
              }
              <Table rowKey="id"
                columns={[
                  { title: "Tên thuốc", dataIndex: "name" },
                  { title: "Ghi chú", dataIndex: "note" },
                  { title: "Liều dùng", dataIndex: "dosage" },
                  { title: "Số lần/ngày", dataIndex: "frequency" },
                  {
                    title: "Thao tác",
                    dataIndex: "actions",
                    width: 150,
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="Chỉnh sửa">
                          <Button
                            size="small"
                            icon={<Edit className="w-4 h-4" />}
                            onClick={() => {
                              setSelectedMedicine({ ...record });
                              setIsCreate(false);
                            }}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Xóa thuốc này?"
                          onConfirm={() => handleRemoveMedicine(record)}
                        >
                          <Button size="small" icon={<Delete className="w-4 h-4" />} danger />
                        </Popconfirm>
                      </Space>
                    ),
                  }

                ]}
                dataSource={medicinesAdded}
                pagination={false}
              />

            </>
          )}

      </Form>
    </Modal>
  );
};

export default DoctorExaminationRecordModal;
