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

// 1. Define DoctorSlot and DoctorRow interfaces
interface DoctorSlot {
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
  };
  clinic: {
    id: number;
    name: string;
  };
}

interface DoctorRow {
  doctor: {
    id: number;
    full_name: string;
  };
  nearestSlot?: DoctorSlot;
  clinic?: {
    id: number;
    name: string;
  };
}




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
  const [availableDoctors, setAvailableDoctors] = useState<DoctorRow[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectDoctor, setSelectDoctor] = useState<DoctorRow | null>(null);
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
      

          const resDoctors = await getAvailableDoctors(Number(to_clinic_id));
         

          const doctors = resDoctors.data.data;
          // filter doctor không phải là doctor đang làm việc ở phòng khám hiện tại
          const filteredDoctors = doctors.filter((doctor: any) => doctor.doctor.id != doctor_id);
          console.log(filteredDoctors)
          setAvailableDoctors(filteredDoctors || []);
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
      // console.log("values", values)
      setLoading(true);
      
      // Kiểm tra xem có chọn phòng khám không
      if (!values.to_clinic_id) {
        message.error("Vui lòng chọn phòng khám tiếp theo");
        return;
      }
      
      // Kiểm tra xem có bác sĩ rảnh không
      if (availableDoctors.length === 0) {
        message.error("Không có bác sĩ nào rảnh trong phòng khám này. Vui lòng chọn phòng khám khác.");
        return;
      }
      
      // Kiểm tra xem có chọn bác sĩ không
      if (!values.to_doctor_id) {
        message.error("Vui lòng chọn bác sĩ tiếp nhận");
        return;
      }

      await mainRequest.post("/api/v1/queue/assign-clinic", {
        ...values,
        patient_id: patient_id,
        clinic_id: clinic_id,     
        doctor_id: doctor_id,
        to_doctor_id: values.to_doctor_id,
        from_clinic_id: clinic_id,
        appointment_date: selectDoctor?.nearestSlot?.slot_date,
        appointment_time: selectDoctor?.nearestSlot?.start_time,
        appointment_id: appointment_id,
        reason: values.reason || "",
        note: values.note || "",
        extra_cost: isShowOtherPrice ? values.extra_cost || 0 : 0,

        priority: 2,
      });

      message.success("Chuyển phòng khám thành công!");
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error("Error assigning clinic:", err);
      const errorMessage = err?.response?.data?.message || "Có lỗi xảy ra khi chuyển phòng khám!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clinicSelected = clinics.find((c) => c.id === Number(to_clinic_id));

  const handleChangeClinic = (value: any) => {
    
    form.setFieldsValue({
      to_clinic_id: value,
      to_doctor_id: null
    });
  };
  



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
          </Select>
        </Form.Item>
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
                  onChange={(value: number) => {
                    form.setFieldsValue({ slot: undefined }); // Reset slot when changing doctor
                    const selected = availableDoctors.find(item => item.doctor.id === value) || null;
                    setSelectDoctor(selected);
                    setSelectedDoctorId(value);
                  }}
                >
                  {availableDoctors.map((row: DoctorRow) => (
                    <Option key={row.doctor.id} value={row.doctor.id}>
                      {row.doctor.full_name} - {row.nearestSlot?.slot_date ? new Date(row.nearestSlot.slot_date).toLocaleDateString('vi-VN') : 'N/A'} {row.nearestSlot?.start_time.slice(11,19)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )
              :
              <div style={{ padding: '12px', backgroundColor: '#fff2e8', border: '1px solid #ffbb96', borderRadius: '6px', color: '#d46b08' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>⚠️ Không có bác sĩ nào rảnh</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                  Tất cả bác sĩ trong phòng khám này đều không có slot khám rảnh trong tương lai.
                </p>
              </div>
            }
          </>
        )}



      </Form>
    </Modal>
  );
};

export default ExaminationOrderModal;