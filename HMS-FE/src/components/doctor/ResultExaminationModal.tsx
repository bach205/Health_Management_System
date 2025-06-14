import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import mainRequest from "../../api/mainRequest";
import { getClinicService } from "../../services/clinic.service";
import { getDoctorsInClinic, getDoctorAvailableSlots } from "../../services/doctor.service";


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
  const [clinics, setClinics] = useState<any[]>([
  ]);
  const allClinics = [
    { value: "", label: "Không chỉ định phòng khám tiếp theo" },
    ...(clinics?.map((c) => ({ value: c.id, label: c.name }))).filter((c) => c.value !== clinicId),
  ];


  const [doctorInClinic, setDoctorInClinic] = useState<any[]>([
    { value: 1, label: "bác sĩ 1" },
    { value: 2, label: "bác sĩ 2" },
  ]);
  const [selectedClinicId, setSelectedClinicId] = useState<any>(null);

  const [availableDoctorTime, setAvailableDoctorTime] = useState<any[]>([
    { value: "08:00", label: "08:00" },
    { value: "09:00", label: "09:00" },
    { value: "10:00", label: "10:00" },
    { value: "11:00", label: "11:00" },
    { value: "12:00", label: "12:00" },
    { value: "13:00", label: "13:00" },
    { value: "14:00", label: "14:00" },
    { value: "15:00", label: "15:00" },
    { value: "16:00", label: "16:00" },
    { value: "17:00", label: "17:00" },
    { value: "18:00", label: "18:00" },
    { value: "19:00", label: "19:00" },


  ]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<any>(null);

  // const to_clinic_id = Form.useWatch("to_clinic_id", form);
  // const clinicSelected = clinics.find((c) => c.id === Number(to_clinic_id));

  useEffect(() => {
    const getDoctorInClinic = async (clinicId: number) => {
      try {
        const res = await getDoctorsInClinic(clinicId);
        console.log(res)
        if (res.data.metadata.user) {
          setDoctorInClinic(res.data.metadata.user?.map((doctor: any) => ({ value: doctor.id, label: doctor.user_name })) || []);
        } else {
          setDoctorInClinic([]);
        }
      } catch (err: any) {
        console.log(err);
        message.error("Có lỗi xảy ra!");
      }

    };
    console.log(selectedClinicId)
    if (selectedClinicId) {
      getDoctorInClinic(selectedClinicId);
    }
  }, [selectedClinicId]);

  useEffect(() => {
    const getAvailableDoctorTime = async (clinicId: number, doctorId: number) => {
      try {
        const res = await getDoctorAvailableSlots(clinicId, doctorId);
        setAvailableDoctorTime(res.data.metadata.available_doctor_time || []);
      } catch (err: any) {
        console.log(err);
        message.error("Có lỗi xảy ra!");
      }
    };
    if (selectedDoctorId && selectedClinicId) {
      getAvailableDoctorTime(selectedClinicId, selectedDoctorId);
    }
  }, [selectedDoctorId, selectedClinicId]);

  useEffect(() => {
    const getClinics = async () => {
      try {
        const res = await getClinicService();
        setClinics(res.data.metadata.clinics || []);
      } catch (err: any) {
        console.log(err);
        message.error("Có lỗi xảy ra!");
      }
    }
    getClinics();
  }, [open]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (
        values.examined_at &&
        dayjs(values.examined_at).isAfter(dayjs().hour(20).minute(59).second(59))
      ) {
        toast.error("Thời gian khám không hợp lệ!");
        return;
      }

      await mainRequest.post("api/v1/examination-detail", {
        ...values,
        patient_id: patientId,
        clinic_id: selectedClinicId,
        doctor_id: selectedDoctorId,
        status: "pending",
        from_clinic_id: clinicId,
        created_by_user_id: currentUserId,
        examined_at: values.examined_at ? dayjs(values.examined_at).toISOString() : undefined,
        total_cost: values.total_cost || 0,
        to_clinic_id: selectedClinicId
          ? Number(selectedClinicId)
          : undefined,
      });

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={handleClose}
      title="Nhập kết quả khám phòng"
      onOk={form.submit}
      confirmLoading={loading}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          Lưu kết quả
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          examined_at: dayjs(),
          to_clinic_id: "",
        }}
      >
        <Form.Item
          name="result"
          label="Kết quả khám"
          rules={[{ required: true, message: "Vui lòng nhập kết quả khám" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} />
        </Form.Item>

        {/* <Form.Item
          name="examined_at"
          label="Thời gian khám"
          rules={[{ required: true, message: "Vui lòng chọn thời gian khám" }]}
        >
          <DatePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            className="w-full"
          />
        </Form.Item> */}

        <Form.Item name="total_cost" label="Tổng chi phí">
          <InputNumber className="w-full" min={0} />
        </Form.Item>

        {/* <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select options={statusOptions} />
        </Form.Item> */}

        {
          // dayjs().hour(17).minute(0).second(0).isAfter(dayjs())
          true
            ? (
              <Form.Item
                name="to_clinic_id"
                label="Chỉ định phòng khám tiếp theo"
                rules={[
                  {
                    validator(_, value) {
                      if (value === "" || (!isNaN(Number(value)) && Number(value) > 0)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Vui lòng chọn phòng khám hợp lệ"));
                    },
                  },
                ]}
              >
                <Select onChange={(value) => {
                  if (value === "") {
                    setSelectedClinicId(value)
                    setSelectedDoctorId(null)
                  } else {
                    setSelectedClinicId(value)
                  }
                }}
                  options={allClinics} />
              </Form.Item>
            ) : (
              <Form.Item name="to_clinic_id" label="Chỉ định phòng khám tiếp theo">
                <div className="text-red-500">* Đã quá giờ chỉ định phòng khám tiếp theo</div>
              </Form.Item>
            )
        }

        {(selectedClinicId && selectedClinicId !== "") && (
          <>
            <div className="mb-2 text-sm">
              Số lượng bệnh nhân:{" "}
              <span
                className={`text-white px-2 py-1 rounded ${selectedClinicId.patient_volume === "high"
                  ? "bg-red-500"
                  : selectedClinicId.patient_volume === "medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                  }`}
              >
                {selectedClinicId.patient_volume === "high"
                  ? "Đông"
                  : selectedClinicId.patient_volume === "medium"
                    ? "Vừa phải"
                    : "Ít"}
              </span>
            </div>

            <Form.Item
              name="doctor_id"
              label="Bác sĩ"

              rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
            >
              <Select onChange={(value) => setSelectedDoctorId(value)} options={doctorInClinic} />
            </Form.Item>
            {
              selectedDoctorId && (
                <>
                  <div className="mb-2 text-sm">
                    Thời gian khám: {availableDoctorTime.length > 0 ? availableDoctorTime.map((time) => time.time).join(", ") : "Hết ca khám"}
                  </div>
                </>
              )
            }
          </>
        )}

      </Form>
    </Modal>
  );
};

export default ResultExaminationModal;
