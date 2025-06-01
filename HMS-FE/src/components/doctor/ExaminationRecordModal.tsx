import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import TextFieldControl from "@/components/form/TextFieldControl";
import mainRequest from "@/api/mainRequest";
import { useState } from "react";
import { toast } from "react-toastify";

interface ExaminationRecordModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  doctorId?: number;
  onSuccess?: () => void;
}

const ExaminationRecordModal = ({
  open,
  onClose,
  patientId,
  doctorId,
  onSuccess,
}: ExaminationRecordModalProps) => {
  const { control, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await mainRequest.post("/examination-records", {
        ...values,
        patient_id: patientId,
        primary_doctor_id: doctorId,
      });
      if (onSuccess) onSuccess();
      reset();
      onClose();
      toast.success("Tạo hồ sơ khám tổng quát thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo hồ sơ khám tổng quát"
      paperProps={{
        className: "w-full max-w-md",
      }}
      content={
        <form
          className="space-y-4 bg-white p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextFieldControl
            name="symptoms"
            control={control}
            label="Triệu chứng"
            rules={{ required: "Vui lòng nhập triệu chứng" }}
          />
          <TextFieldControl
            name="final_diagnosis"
            control={control}
            label="Chẩn đoán cuối cùng"
            rules={{ required: "Vui lòng nhập chẩn đoán cuối cùng" }}
          />
        </form>
      }
      action={
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
        >
          Lưu hồ sơ
        </button>
      }
    />
  );
};

export default ExaminationRecordModal;
