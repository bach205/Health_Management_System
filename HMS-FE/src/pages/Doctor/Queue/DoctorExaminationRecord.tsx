import { Modal, Form, Input, Button, Checkbox, Flex, InputNumber, Popconfirm, Select, Space, Table, Tooltip, Empty } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import mainRequest from "../../../api/mainRequest";
import { Check, CircleCheck, Delete, Edit } from "lucide-react";
import { useMedicineList } from "../../../hooks/useMedicineList";
import type { IMedicine } from "../../../types/index.type";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");
import { bookAppointmentService, getAvailableTimeSlotsService } from "../../../services/appointment.service";
import { PushANotification } from "../../../api/notification";
import AddMedicine from "./AddMedicine";
interface ExaminationRecordModalProps {
  open: boolean;
  onClose: () => void;
  patient_id: number;
  clinic_id: number;
  appointment_id: number;
  doctor_id?: number;
  onSuccess?: () => void;
}


const DoctorExaminationRecordModal = ({
  open,
  onClose,
  patient_id,
  appointment_id,
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
  const { medicines } = useMedicineList({
    total: 0,
    pageSize: undefined,
    current: 1,
  });

  const [isFormDisabled, setIsFormDisabled] = useState(false);  // disable form
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false); // đã bấm "lưu hồ sơ"

  const [isSaved, setIsSaved] = useState(false);                // đã lưu hồ sơ


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
          groupedByDate[slot.slot_date || {}].push(slot);
        });

        setSlotsByDate(groupedByDate);
      } catch (err) {
        toast.error("Không thể tải lịch khám");
      }
    };
    if (open) fetchSlots();
  }, [open, doctor_id, selectedClinic]);


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

      if (isFollowUp && !selectedSlotId) {
        toast.error("Vui lòng chọn giờ tái khám!");
        setLoading(false);
        return;
      }

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

      await mainRequest.post("/api/v1/examination-record", {
        patient_id,
        doctor_id,
        clinic_id,
        appointment_id,
        result: values.result,
        note: values.note ?? "",
        prescription_items: medicinesAdded.map((med) => ({
          medicine_id: med.id,
          note: med.note ?? null,
          dosage: med.dosage ?? null,
          quantity: med.quantity ?? 0,
        }))
      });


      toast.success("Tạo hồ sơ khám thành công!");
      handleSetIsFollowUp(false)
      handleSetMedicineVisible(false);
      setIsReadyToSubmit(false)
      form.resetFields();
      setSelectedDate(null);
      setSelectedSlotId(null);
      setIsSaved(false);
      setIsFormDisabled(false);
      onClose();
      onSuccess?.();
      PushANotification({ message: `Bạn đã nhận được kết quả khám bệnh từ bác sĩ`, userId: patient_id, navigate_url: `/my-appointments/record/${appointment_id}` })

    } catch (err: any) {
      console.error("Error creating examination record:", err);
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

      if (selectedMedicine.quantity && selectedMedicine.quantity <= 0) {
        toast.error("Số lượng thuốc phải lớn hơn 0");
        return;

      }

      if (selectedMedicine.stock && selectedMedicine.stock <= 0) {
        toast.error("Không còn thuốc");
        return;
      }

      const dosage = selectedMedicine.dosageAmount
        ? `${selectedMedicine.dosageAmount} viên / bữa`
        : undefined;

      const frequency = selectedMedicine.frequencyAmount
        ? `${selectedMedicine.frequencyAmount} lần / ngày`
        : undefined;


      const newItem = {
        id: selectedMedicine.id,
        name: selectedMedicine.name,
        dosage,
        frequency,
        stock: selectedMedicine.stock,
        note: selectedMedicine.note,
        quantity: selectedMedicine.quantity || 1, // Sử dụng giá trị quantity từ selectedMedicine hoặc mặc định là 1
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

  console.log("medicinesAdded", medicinesAdded);

  return (
    <Modal title="Tạo hồ sơ khám"
      open={open}
      onCancel={() => {
        handleSetIsFollowUp(false)
        handleSetMedicineVisible(false);
        form.resetFields();
        setSelectedDate(null);
        setSelectedSlotId(null);
        setSelectedMedicine(null);
        setIsFormDisabled(false);
        setIsSaved(false);
        onClose();
      }}

      onOk={() => form.submit()}
      confirmLoading={loading}
      centered
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>Hủy</Button>,

        !isReadyToSubmit ? (
          <Button
            key="preview"
            type="primary"
            onClick={() => {
              setIsFormDisabled(true);
              setIsReadyToSubmit(true);
              setSelectedMedicine(null)
            }}
          >
            Lưu hồ sơ
          </Button>
        ) : (
          <>
            <Button
              key="edit"
              onClick={() => {
                setIsFormDisabled(false);
                setIsReadyToSubmit(false);
              }}
            >
              Cập nhật hồ sơ
            </Button>
            <Button
              key="submit"
              type="primary" className="!bg-green-500 !border-green-500 hover:!bg-green-600 hover:!border-green-600"
              loading={loading}
              onClick={() => form.submit()}
            >
              <CircleCheck className="mr-1 w-3 h-3" />
              Khám xong
            </Button>
          </>
        )
      ]}
      destroyOnHidden
    >
      <Form disabled={isFormDisabled} form={form} layout="vertical" onFinish={onFinish} className="pt-2">
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
              {
                clinics.length > 0 ?
                  <Form.Item label="Chọn phòng khám">
                    <div className="flex gap-2 flex-wrap">
                      {clinics?.map(clinic => (
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
                  :
                  <Empty description="Không còn lịch khám" />
              }

              {/* Chọn ngày khám */}
              {selectedClinic && (
                <Form.Item label="Chọn ngày tái khám">
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(slotsByDate).map(date => {
                      const weekday = dayjs(date).locale('vi').format("dddd");
                      const dateStr = dayjs(date).format("DD/MM/YYYY");
                      // Kiểm tra nếu ngày khám <= hôm nay thì bỏ qua
                      // if (dayjs(date).isBefore(dayjs(), 'minute')) {
                      //   return null; // Nếu ngày khám là quá khứ thì bỏ qua
                      // }
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
              <Flex justify="space-between" align="center" className="mb-4">
                <Form.Item label="Đơn thuốc" layout="horizontal" >
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
                    disabled={!isCreate || isFormDisabled} // <-- THÊM Ở ĐÂY
                  />
                </Form.Item>

              </Flex>
              <AddMedicine
                selectedMedicine={selectedMedicine}
                setSelectedMedicine={setSelectedMedicine}
                isCreate={isCreate}
                handleAddMedicine={handleAddMedicine}
              />

              <Table rowKey="id"
                columns={[
                  { title: "Tên thuốc", dataIndex: "name" },
                  { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', },
                  { title: "Liều dùng", dataIndex: "dosage" },
                  { title: "Số lần/ngày", dataIndex: "frequency" },
                  { title: "Tồn kho", dataIndex: "stock", hidden: true },
                  { title: "Ghi chú", dataIndex: "note" },
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
                              const [dosageAmountStr, dosageUnit] = record.dosage?.split(' ') || [];
                              const dosageAmount = parseInt(dosageAmountStr || "1");

                              const [frequencyAmountStr] = record.frequency?.split(' ') || [];
                              const frequencyAmount = parseInt(frequencyAmountStr || "1");

                              setSelectedMedicine({
                                ...record,
                                stock: record.stock,
                                dosageAmount: isNaN(dosageAmount) ? undefined : dosageAmount,
                                dosageUnit: dosageUnit || "viên",
                                frequencyAmount: isNaN(frequencyAmount) ? undefined : frequencyAmount,
                                frequencyUnit: "ngày", // vì bạn đang cố định "bữa / ngày"
                              });

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
