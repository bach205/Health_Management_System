import Modal from "@/components/ui/Modal";
import { useState } from "react";
import { toast } from "react-toastify";

const ExaminationOrderModal = ({
  open,
  onClose,
  patient,
  clinics,
  selectedClinicId,
  onSuccess,
}: ExaminationOrderModalProps) => {
  const [assignClinicId, setAssignClinicId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const handleClose = () => {
    setAssignClinicId("");
    onClose();
  };
  console.log(patient);

  if (!patient) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Chỉ định khám thêm cho bệnh nhân"
      paperProps={{
        className: "w-full max-w-md",
      }}
      content={
        <div className="flex flex-col bg-white rounded-xs justify-start items-start">
          <h2 className="text-black p-2 font-medium text-md">Phòng khám</h2>
          <div className="border-b border-gray-200 w-full" />
          <div className="space-x-1.5 space-y-2 p-5 items-start w-full">
            <div className="mb-2">
              Bệnh nhân: <b>{patient?.full_name}</b>
            </div>
            <label htmlFor="assign-clinic" className="block mb-1">
              Chọn phòng khám:
            </label>
            <select
              id="assign-clinic"
              value={assignClinicId}
              onChange={(e) => setAssignClinicId(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">-- Chọn phòng --</option>
              {clinics
                .filter((c: any) => c.id.toString() !== selectedClinicId)
                .map((clinic: any) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      }
      action={
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={handleClose}
          >
            Hủy
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={!assignClinicId || assignLoading}
            onClick={async () => {
              setAssignLoading(true);
              try {
                const mainRequest = (await import("@/api/mainRequest")).default;
                await mainRequest.post("/queues/queue-clinic/assign", {
                  patient_id: patient.id,
                  to_clinic_id: Number(assignClinicId),
                  record_id: patient.record_id,
                  priority: 0,
                });
                if (onSuccess) onSuccess();
                setAssignClinicId("");
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
              } finally {
                setAssignLoading(false);
              }
            }}
          >
            Xác nhận
          </button>
        </div>
      }
    />
  );
};

export default ExaminationOrderModal;

interface ExaminationOrderModalProps {
  open: boolean;
  onClose: () => void;
  patient: any;
  clinics: any[];
  selectedClinicId: string;
  onSuccess?: () => void;
}
