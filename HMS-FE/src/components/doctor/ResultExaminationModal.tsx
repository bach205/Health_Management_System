import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import TextFieldControl from "@/components/form/TextFieldControl";
import SelectFieldControl from "@/components/form/SelectFieldControl";
import mainRequest from "@/api/mainRequest";
import { useState, useEffect } from "react";
import { getClinics } from "@/services/clinic.service";
import { toast } from "react-toastify";

const statusOptions = [
  { value: "pending", label: "Chờ khám" },
  { value: "in_progress", label: "Đang khám" },
  { value: "done", label: "Đã khám" },
  { value: "cancelled", label: "Hủy" },
];

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
      examined_at: new Date(),
    },
  });
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const to_clinic_id = watch("to_clinic_id");
  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (open) {
      getClinics().then((res) => {
        setClinics(res.metadata || []);
      });
    }
  }, [open]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await mainRequest.post("/examination-details", {
        ...values,
        patient_id: patientId,
        clinic_id: clinicId,
        doctor_id: doctorId,
        from_clinic_id: clinicId,
        created_by_user_id: currentUserId,
        examined_at: new Date(values.examined_at).toISOString(),
        total_cost: values.total_cost || 0,
        to_clinic_id: values.to_clinic_id
          ? Number(values.to_clinic_id)
          : undefined,
      });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // Danh sách phòng khám chỉ định tiếp theo (loại trừ phòng hiện tại)
  const clinicOptions = clinics
    .filter((c) => c.id !== clinicId)
    .map((c) => ({
      value: c.id,
      label: `${c.name}`,
    }));

  const clinicSelected = clinics.find((c) => c.id === Number(to_clinic_id));

  const nextClinicOptions = [
    { value: "", label: "Không chỉ định phòng tiếp theo" },
    ...clinicOptions,
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nhập kết quả khám phòng"
      paperProps={{ className: "w-full max-w-2xl" }}
      content={
        <form
          className="space-y-4 bg-white p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextFieldControl
            name="result"
            control={control}
            label="Kết quả khám"
            rules={{ required: "Vui lòng nhập kết quả khám" }}
          />
          <TextFieldControl name="note" control={control} label="Ghi chú" />
          <TextFieldControl
            name="examined_at"
            control={control}
            label="Thời gian khám (YYYY-MM-DD HH:mm)"
            type="datetime-local"
            rules={{ required: "Vui lòng nhập thời gian khám" }}
          />
          <TextFieldControl
            name="total_cost"
            control={control}
            type="number"
            label="Tổng chi phí"
          />
          <SelectFieldControl
            name="status"
            control={control}
            label="Trạng thái"
            options={statusOptions}
            rules={{ required: "Vui lòng chọn trạng thái" }}
          />
          <div className="flex flex-col">
            <SelectFieldControl
              name="to_clinic_id"
              control={control}
              label="Chỉ định phòng khám tiếp theo"
              options={nextClinicOptions}
              rules={{
                validate: (value: any) =>
                  (value !== "" &&
                    !isNaN(Number(value)) &&
                    Number(value) > 0) ||
                  "Vui lòng chọn phòng khám hợp lệ",
              }}
            />
            {clinicSelected && (
              <div className="text-sm flex items-center gap-2 mt-2">
                Số lượng bệnh nhân:{" "}
                <span
                  className={`text-sm ${
                    to_clinic_id
                      ? `block text-white px-2 py-0.5 rounded-lg ${
                          clinicSelected.patient_volume === "high"
                            ? "bg-red-500"
                            : clinicSelected.patient_volume === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`
                      : "hidden"
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
