import Modal from "../../components/ui/Modal";
import { useForm } from "react-hook-form";
import TextFieldControl from "../../components/form/TextFieldControl";
import SelectFieldControl from "../../components/form/SelectFieldControl";
import mainRequest from "../../api/mainRequest";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getClinicService } from "../../services/clinic.service";
import { getDoctorsInClinic, getDoctorAvailableSlots } from "../../services/doctor.service";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { message } from "antd";
dayjs.extend(utc);
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
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      to_clinic_id: "",
      to_doctor_id: "",
      examined_at: new Date(),
    },
  });
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctorsInClinic, setDoctorsInClinic] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const to_clinic_id = watch("to_clinic_id");
  const to_doctor_id = watch("to_doctor_id");

  const handleClose = () => {
    reset();
    setDoctorsInClinic([]);
    setAvailableSlots([]);
    onClose();
  };

  // Lấy danh sách phòng khám
  useEffect(() => {
    if (open) {
      getClinicService().then((res) => {
        setClinics(res.data.metadata.clinics || []);
      });
    }
  }, [open]);

  // Lấy danh sách bác sĩ khi chọn phòng khám
  useEffect(() => {
    if (to_clinic_id) {
      getDoctorsInClinic(Number(to_clinic_id))
        .then((res: any) => {
          setDoctorsInClinic(res.data.metadata || []);
        })
        .catch(() => {
          setDoctorsInClinic([]);
          toast.error("Không lấy được danh sách bác sĩ");
        });
    } else {
      setDoctorsInClinic([]);
      setAvailableSlots([]);
    }
  }, [to_clinic_id]);

  // Lấy slots trống khi chọn bác sĩ
  useEffect(() => {
    if (to_doctor_id) {
      getDoctorAvailableSlots(Number(to_doctor_id))
        .then((res: any) => {
          setAvailableSlots([{
            slot_date: "",
            start_time: "",
          }, ...res.data.metadata]);
        })
        .catch(() => {
          setAvailableSlots([
            {
              slot_date: "",
              start_time: "",
            }
          ]);
          toast.error("Không lấy được lịch trống của bác sĩ");
        });
    } else {
      setAvailableSlots([
        {
          slot_date: "",
          start_time: "",
        }
      ]);
    }
  }, [to_doctor_id]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log("values", values)
      if (to_clinic_id !== "" && to_doctor_id === "") {
        message.error("Vui lòng chọn bác sĩ");
        return;
      }
      // Parse slot nếu có
      let slotInfo = {};
      if (values.slot) {
        const parsedSlot = JSON.parse(values.slot);
        slotInfo = {
          slot_date: parsedSlot.slot_date,
          start_time: parsedSlot.start_time,
        };
      }
      if (slotInfo.slot_date === "" || slotInfo.start_time === "") {
        message.error("Vui lòng chọn ca khám");
        return;
      }
      // await mainRequest.post("/api/v1/examination-detail", {
      //   ...values,
      //   patient_id: patientId,
      //   clinic_id: clinicId,
      //   doctor_id: doctorId,
      //   from_clinic_id: clinicId,
      //   created_by_user_id: currentUserId,
      //   examined_at: new Date(values.examined_at).toISOString(),
      //   // Nếu chuyển phòng thì gửi thêm thông tin slot
      //   ...(values.to_clinic_id ? {
      //     to_clinic_id: Number(values.to_clinic_id),
      //     to_doctor_id: Number(values.to_doctor_id),
      //     total_cost: values.total_cost || 0,
      //     ...slotInfo
      //   } : {})
      // });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  const clinicSelected = clinics.find((c) => c.id === Number(to_clinic_id));
  const nextClinicOptions = [
    { value: "", label: "Không chỉ định phòng tiếp theo" },
    ...clinics
      .filter((c) => c.id !== clinicId)
      .map((c) => ({
        value: c.id,
        label: c.name,
      })),
  ];
  const doctorOptions = [
    { value: "", label: "Chọn bác sĩ" },
    ...doctorsInClinic.map((d: any) => ({
      value: d.id,
      label: d.full_name,
    })),
  ];
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nhập kết quả khám phòng"
      paperProps={{ className: "w-full max-w-2xl" }}
      content={
        <form className="space-y-4 bg-white p-4" onSubmit={handleSubmit(onSubmit)}>
          <TextFieldControl
            name="result"
            control={control}
            label="Kết quả khám"
            rules={{ required: "Vui lòng nhập kết quả khám" }}
          />
          <TextFieldControl
            name="note"
            control={control}
            label="Ghi chú"
          />
          {/* Chi phí chuyển phòng */}
          <TextFieldControl
            name="total_cost"
            control={control}
            type="number"
            label="Chi phí chuyển phòng"
          />
          {/* Chỉ hiện total_cost khi không chuyển phòng */}
          {!to_clinic_id && (
            <TextFieldControl
              name="total_cost"
              control={control}
              type="number"
              label="Tổng chi phí"
            />
          )}

          <div className="flex flex-col gap-4">
            <SelectFieldControl
              name="to_clinic_id"
              control={control}
              label="Chỉ định phòng khám tiếp theo"
              options={nextClinicOptions}
              rules={{ required: false }}
            />

            {clinicSelected && (
              <div className="text-sm flex items-center gap-2">
                Số lượng bệnh nhân:{" "}
                <span className={`text-white px-2 py-1 rounded ${clinicSelected.patient_volume === "high" ? "bg-red-500"
                  : clinicSelected.patient_volume === "medium" ? "bg-yellow-500"
                    : "bg-green-500"
                  }`}>
                  {clinicSelected.patient_volume === "high" ? "Đông"
                    : clinicSelected.patient_volume === "medium" ? "Vừa phải"
                      : "Ít"}
                </span>
              </div>
            )}

            {to_clinic_id && (
              <>
                {
                  (doctorOptions && doctorOptions.length > 0) ? <SelectFieldControl
                    name="to_doctor_id"
                    control={control}
                    label="Chọn bác sĩ khám"
                    options={doctorOptions}
                    rules={{
                      validate: (value: any) => {
                        if (to_clinic_id && !value) {
                          return "Vui lòng chọn bác sĩ";
                        }
                        return true;
                      },
                    }}
                  />
                    :
                    <SelectFieldControl
                      name="to_doctor_id"
                      control={control}
                      label="Chọn bác sĩ khám"
                      options={[{ value: "", label: "Không có bác sĩ trong phòng" }]}
                      rules={{ required: false }}
                      disabled
                    />
                }


                {to_doctor_id && (
                  availableSlots.length > 0 ? (
                    <SelectFieldControl
                      name="slot"
                      control={control}
                      label="Chọn ca khám"
                      options={availableSlots?.map((slot: any) => ({
                        value: JSON.stringify({
                          slot_date: slot.slot_date || "",
                          start_time: slot.start_time || ""
                        }),
                        label: `${slot.start_time ? dayjs.utc(slot.start_time).format("HH:mm") : ""} - ${slot.end_time ? dayjs.utc(slot.end_time).format("HH:mm") : ""}`
                      }))}
                      defaultValue={JSON.stringify({
                        slot_date: availableSlots[0]?.slot_date,
                        start_time: availableSlots[0]?.start_time
                      })}
                      rules={{ required: "Vui lòng chọn ca khám" }}
                    />
                  ) : (
                    <SelectFieldControl
                      name="slot"
                      control={control}
                      label="Chọn ca khám"
                      options={[{ value: "", label: "Không có ca khám" }]}
                      rules={{ required: false }}
                      disabled
                    />
                  )
                )}
              </>
            )}
          </div>
        </form>
      }
      action={
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          Lưu kết quả
        </button>
      }
    />
  );
};

export default ResultExaminationModal;