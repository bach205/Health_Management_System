import { Modal, Form, Input, Select, InputNumber, Button, message, DatePicker, Checkbox } from "antd";
import { useEffect, useState } from "react";
import { getClinicService } from "../../../services/clinic.service";
import { getDoctorsInClinic, getDoctorAvailableSlotsByDoctorId, getDoctorAvailableSlotsByDate, getAvailableDoctors } from "../../../services/doctor.service";
import mainRequest from "../../../api/mainRequest";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { IDoctor } from "../../../types/index.type";

dayjs.extend(utc);

const { Option } = Select;

interface ExaminationOrderModalProps {
  open: boolean;
  onClose: () => void;
  patient_id: number;
  clinic_id: number;
  doctor_id?: number;
  appointment_id?: number;
  currentUserId?: number;
  onSuccess?: () => void;
}

const ExaminationOrderModal = ({
  open,
  onClose,
  patient_id,
  clinic_id,
  doctor_id,
  appointment_id,
  currentUserId,
  onSuccess,
}: ExaminationOrderModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  // const [clinicVolume, setClinicVolume] = useState<number>(0);
  const [isShowOtherPrice, setIsShowOtherPrice] = useState<boolean>(false);
  const [availableDoctors, setAvailableDoctors] = useState<IDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
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
      const fetchClinicVolumeAndDoctors = async () => {
        try {
          const res = await getClinicService();
          console.log(res)

          const resDoctors = await getAvailableDoctors(Number(to_clinic_id));
          console.log(resDoctors.data)
          const doctors = resDoctors.data.metadata;
          setAvailableDoctors(doctors || []);
          console.log(doctors);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin phòng khám hoặc bác sĩ:", error);
          setAvailableDoctors([]);
        }
      };
      fetchClinicVolumeAndDoctors();
    } else {
      setAvailableDoctors([]);
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

      await mainRequest.post("/api/v1/queue/assign-clinic", {
        ...values,
        patient_id: patient_id,
        clinic_id: clinic_id,
        doctor_id: doctor_id,
        from_clinic_id: clinic_id,
        appointment_id: appointment_id,
        reason: values.reason || "",
        note: values.note || "",
        extra_cost: isShowOtherPrice ? values.extra_cost || 0 : 0,

        priority: 2, // Chuyển phòng khám
        // created_by_user_id: currentUserId,
        // examined_at: new Date().toISOString(),
        // ...(values.to_clinic_id
        //   ? {
        //     to_clinic_id: Number(values.to_clinic_id),
        //     to_doctor_id: Number(values.to_doctor_id),
        //     total_cost: values.total_cost || 0,
        //     ...slotInfo,
        //   }
        //   : {}),
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
  };
  console.log("availableDoctors", availableDoctors);


  return (
    <Modal
      open={open}
      title="Chuyển phòng khám"
      onCancel={handleClose}
      cancelText="Hủy"
      footer={[
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Chuyển phòng
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          label="Lý do chuyển phòng khám"
          name="reason"
          rules={[{ required: true, whitespace: true, message: "Vui lòng nhập lý do chuyển phòng khám" }]}
        >
          <Input.TextArea />
        </Form.Item>


        <Form.Item
          label="Chi phí phụ"
          valuePropName="checked"
          layout="horizontal"
        >
          <Checkbox onChange={(e) => setIsShowOtherPrice(e.target.checked)} />
        </Form.Item>
        {
          isShowOtherPrice &&
          <Form.Item name="extra_cost" >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        }

        
        <Form.Item label="Ghi chú" name="note" >
          <Input.TextArea placeholder="Nhập ghi chú" />
        </Form.Item>


        <Form.Item label="Chỉ định phòng khám tiếp theo" name="to_clinic_id" rules={[{ required: true, message: "Vui lòng chọn phòng khám tiếp theo" }]}>
          <Select allowClear placeholder="Chọn phòng khám" onChange={handleChangeClinic}>
            {clinics
              .filter((c) => c.id !== clinic_id)
              .map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            <Option value={""}>-</Option>

          </Select>
        </Form.Item>

        {/* {clinicSelected && (
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
        )} */}
        {clinicSelected && (
          <>
            {availableDoctors.length > 0 ? (
              <Form.Item
                label="Bác sĩ tiếp nhận"
                name="to_doctor_id"
                rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
              >
                <Select
                  placeholder="Chọn bác sĩ rảnh"
                  optionFilterProp="children"
                  onChange={(value) => {
                    form.setFieldsValue({ slot: undefined }); // Reset slot when changing doctor
                    setSelectedDoctorId(value);
                  }}
                >
                  {availableDoctors.map((row : any) => (
                    <Option key={row.doctor.id} value={row.doctor.id} >
                      {row.doctor.full_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )
              :
              <p>Không có bác sĩ nào rảnh</p>
            }
          </>
        )}



      </Form>
    </Modal>
  );
};

export default ExaminationOrderModal;
