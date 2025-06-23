import { Modal, Form, Input, Select, InputNumber, Button, message, DatePicker } from "antd";
import { useEffect, useState } from "react";
import { getClinicService } from "../../../services/clinic.service";
import { getDoctorsInClinic, getDoctorAvailableSlotsByDoctorId, getDoctorAvailableSlotsByDate } from "../../../services/doctor.service";
import mainRequest from "../../../api/mainRequest";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toast } from "react-toastify";

dayjs.extend(utc);

const { Option } = Select;

interface ResultExaminationModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  clinicId: number;
  doctorId?: number;
  currentUserId?: number;
  onSuccess?: () => void;
}

const ResultExaminationModal = ({
  open,
  onClose,
  patientId,
  clinicId,
  doctorId,
  currentUserId,
  onSuccess,
}: ResultExaminationModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctorsInClinic, setDoctorsInClinic] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [slotDate, setSlotDate] = useState<string>("");

  const to_clinic_id = Form.useWatch("to_clinic_id", form);
  const to_doctor_id = Form.useWatch("to_doctor_id", form);

  const handleClose = () => {
    form.resetFields();
    setDoctorsInClinic([]);
    setAvailableSlots([]);
    setSlotDate("");
    onClose();
  };

  useEffect(() => {
    if (open) {
      getClinicService().then((res) => {
        setClinics(res.data.metadata.clinics || []);
      });
    }
  }, [open]);

  useEffect(() => {
    if (to_clinic_id) {
      getDoctorsInClinic(Number(to_clinic_id))
        .then((res) => setDoctorsInClinic(res.data.metadata || []))
        .catch(() => {
          setDoctorsInClinic([]);
          toast.error("Không lấy được danh sách bác sĩ");
        });
    } else {
      setDoctorsInClinic([]);
      setAvailableSlots([]);
    }
  }, [to_clinic_id]);


  const fetchAvailableSlots = async (slot_date: string) => {
    try {
 
      const response = await getDoctorAvailableSlotsByDate(Number(to_doctor_id), slot_date, Number(to_clinic_id));
      console.log(response)
      if (response?.data?.data?.length > 0) {
        setAvailableSlots([{
          slot_date: "",
          start_time: "",
        }, ...response?.data?.data]);
      } else {
        setAvailableSlots([
          {
            slot_date: "",
            start_time: "",
          }
        ]);
      }
      console.log(availableSlots)
    } catch (error) {
      console.log(error);
      setAvailableSlots([
        {
          slot_date: "",
          start_time: "",
        }
      ]);
      toast.error("Không lấy được lịch trống của bác sĩ");
    }
  }


  const handleFinish = async (values: any) => {
    try {
      console.log(values)
      setLoading(true);
      if (values.to_clinic_id && !values.to_doctor_id) {
        message.error("Vui lòng chọn bác sĩ");
        return;
      }

      let slotInfo = {};
      if (values.slot) {
        const parsedSlot = JSON.parse(values.slot);
        slotInfo = {
          slot_date: parsedSlot.slot_date,
          start_time: parsedSlot.start_time,
        };
      }

      if (values.to_clinic_id && (!slotInfo.slot_date || !slotInfo.start_time)) {
        message.error("Vui lòng chọn ca khám");
        return;
      }
      await mainRequest.post("/api/v1/examination-detail", {
        ...values,
        patient_id: patientId,
        clinic_id: clinicId,
        doctor_id: doctorId,
        from_clinic_id: clinicId,
        created_by_user_id: currentUserId,
        examined_at: new Date().toISOString(),
        ...(values.to_clinic_id
          ? {
            to_clinic_id: Number(values.to_clinic_id),
            to_doctor_id: Number(values.to_doctor_id),
            total_cost: values.total_cost || 0,
            ...slotInfo,
          }
          : {}),
      });

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const clinicSelected = clinics.find((c) => c.id === Number(to_clinic_id));

  const handleChangeClinic = (value: any) => {
    setAvailableSlots([]);
    form.setFieldsValue({
      to_clinic_id: value,
      to_doctor_id: "",
      slot: "",
      slot_date: "",
    });
  };

  const handleChangeDoctor = (value: any) => {
    setAvailableSlots([]);
    setSlotDate("");
    form.setFieldsValue({
      to_doctor_id: value,
      slot_date: "",
      slot: "",
    });
  };

  const handleChangeDate = (date: any) => {
    if (date) {
      console.log(dayjs(date).format("YYYY-MM-DD"))
      setSlotDate(dayjs(date).format("YYYY-MM-DD"));
      fetchAvailableSlots(dayjs(date).format("YYYY-MM-DD"));
      setAvailableSlots([]);
      form.setFieldsValue({
        slot_date: dayjs(date),
        slot: "",
      });
    }
  }

  return (
    <Modal
      open={open}
      title="Nhập kết quả khám phòng"
      onCancel={handleClose}
      footer={[
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Lưu kết quả
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          label="Kết quả khám"
          name="result"
          rules={[{ required: true, whitespace: true, message: "Vui lòng nhập kết quả khám" }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item label="Ghi chú" name="note">
          <Input.TextArea />
        </Form.Item>

        <Form.Item label="Tổng chi phí" name="total_cost" >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="Chỉ định phòng khám tiếp theo" name="to_clinic_id">
          <Select allowClear placeholder="Không chỉ định phòng tiếp theo" onChange={handleChangeClinic}>
            <Option value={""}>Không chỉ định phòng tiếp theo</Option>
            {clinics
              .filter((c) => c.id !== clinicId)
              .map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        {clinicSelected && (
          <div className="mb-2 text-sm">
            Số lượng bệnh nhân:{" "}
            <span
              className={`text-white px-2 py-1 rounded ${clinicSelected.patient_volume === "high"
                ? "bg-red-500"
                : clinicSelected.patient_volume === "medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
                }`}
            >
              {clinicSelected.patient_volume === "high"
                ? "Đông"
                : clinicSelected.patient_volume === "medium"
                  ? "Vừa phải"
                  : "Ít"}
            </span>
          </div>
        )}

        {to_clinic_id && (
          <>
            <Form.Item
              label="Chọn bác sĩ khám"
              name="to_doctor_id"
              rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
            >
              <Select placeholder="Chọn bác sĩ" onChange={handleChangeDoctor}>
                <Option value={""}>-</Option>
                {doctorsInClinic.map((d) => (
                  <Option key={d.id} value={d.id}>
                    {d.full_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {
              to_doctor_id && (
                <Form.Item label="Ngày khám" name="slot_date" rules={[{ required: true, message: "Vui lòng chọn ngày khám" },]} >
                  <DatePicker minDate={dayjs()} onChange={handleChangeDate} />
                </Form.Item>
              )
            }

            {to_doctor_id && slotDate && (
              <Form.Item
                label="Chọn ca khám"
                name="slot"
                rules={[{ required: true, message: "Vui lòng chọn ca khám" },

                ]}

              >
                <Select placeholder="Chọn ca khám">
                  {/* <Option value={""}>-</Option> */}
                  {availableSlots.length > 1 ?
                   availableSlots.map((slot, index) => (
                    <Option
                      key={index}
                      value={JSON.stringify({
                        slot_date: slot.slot_date,
                        start_time: slot.start_time,
                      })}
                    >
                      {slot.start_time ? `${dayjs.utc(slot.start_time).format("HH:mm")} - ${dayjs.utc(slot.end_time).format("HH:mm")}` : "-"}
                    </Option>
                  ))
                    : [<Option key="none" value=""> - </Option>,]}
                </Select>
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ResultExaminationModal;
