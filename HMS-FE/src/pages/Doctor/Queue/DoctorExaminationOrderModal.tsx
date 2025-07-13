import { Modal, Form, Input, Select, InputNumber, Button, message, DatePicker } from "antd";
import { useEffect, useState } from "react";
import { getClinicService } from "../../../services/clinic.service";
import { getDoctorsInClinic, getDoctorAvailableSlotsByDoctorId, getDoctorAvailableSlotsByDate } from "../../../services/doctor.service";
import mainRequest from "../../../api/mainRequest";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

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
  const [clinicVolume, setClinicVolume] = useState<number>(0);

  const to_clinic_id = Form.useWatch("to_clinic_id", form);

  const handleClose = () => {
    form.resetFields();
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
      const fetchClinicVolume = async () => {
        try {
          const response = await getClinicService();
          const clinic = response.data.metadata.clinics.find((c: any) => c.id === Number(to_clinic_id));
          if (clinic) {
            setClinicVolume(clinic.patient_volume);
          } else {
            setClinicVolume(0);
          }
        } catch (error) {
          console.error("Error fetching clinic volume:", error);
          setClinicVolume(0);
        }
      }
      fetchClinicVolume();
    } else {
      setClinicVolume(0);
    }
  }, [to_clinic_id]);

  const handleFinish = async (values: any) => {
    try {
      console.log(values)
      setLoading(true);
      if (values.to_clinic_id && !values.to_doctor_id) {
        message.error("Vui lòng chọn bác sĩ");
        return;
      }

      let slotInfo: any = {};
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
    form.setFieldsValue({
      to_clinic_id: value,
    });
    setClinicVolume(0); // Reset clinic volume when changing clinic
  };


  return (
    <Modal
      open={open}
      title="Nhập kết quả khám phòng"
      onCancel={handleClose}
      footer={[
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Chuyển phòng
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
            Số lượng bệnh nhân:
            <span className={`text-white ml-2 px-2 py-1 rounded 
            ${clinicVolume > 10
                ? "bg-red-500"
                : clinicVolume < 8 && clinicVolume > 5
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            >
              {clinicVolume > 10
                ? "Đông"
                : clinicVolume < 8 && clinicVolume > 5
                  ? "Vừa phải"
                  : "Ít"
              }
            </span>
          </div>
        )}

      </Form>
    </Modal>
  );
};

export default ResultExaminationModal;
