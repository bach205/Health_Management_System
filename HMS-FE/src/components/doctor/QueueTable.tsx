import { useQueueStore } from "@/store/queueStore";
import { useEffect, useState, useRef } from "react";
import { getClinics } from "@/services/clinic.service";
import { toast } from "react-toastify";
import useQueue from "@/hooks/useQueue";
import { getQueueStatus } from "@/types/queue.type";
import ExaminationOrderModal from "./ExaminationOrderModal";
import { useSocket } from "@/hooks/useSocket";
import { updateQueueStatus } from "@/services/queue.service";
import { Ellipsis } from "lucide-react";
import ResultExaminationModal from "./ResultExaminationModal";
import ExaminationRecordModal from "@/components/doctor/ExaminationRecordModal";
import { useAuthStore } from "@/store/authStore";

const QueueTable = () => {
  const {
    queues,
    pagination,
    totalElements,
    setPagination,
    totalPages,
    reset,
  } = useQueueStore();
  const [showResultModal, setShowResultModal] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("");
  const { fetchQueue } = useQueue();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const { user } = useAuthStore();
  const currentDoctorId = user?.id;

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await getClinics();
        setClinics(res.metadata || []);
        if (res.metadata && res.metadata.length > 0) {
          setSelectedClinic(res.metadata[0].id.toString());
        }
      } catch (error: any) {
        console.log(error);
        toast.error(
          error?.response?.data?.message || "Lỗi khi lấy danh sách phòng khám"
        );
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchQueue(selectedClinic);
    } else {
      reset();
    }
  }, [selectedClinic]);

  useSocket(
    `clinic_${selectedClinic}`,
    "queue:assigned",
    (data: { clinicId: string | number }) => {
      if (data.clinicId?.toString() === selectedClinic.toString()) {
        fetchQueue(selectedClinic);
      }
    }
  );

  useEffect(() => {
    const tableEl = document.getElementById("table-container");
    const heightWindow = window.innerHeight;
    const paginationHeight = document
      .getElementById("pagination")
      ?.getBoundingClientRect().height;
    const tableTop = tableEl?.getBoundingClientRect().top;
    if (tableEl && paginationHeight && tableTop) {
      tableEl.style.height = `${
        heightWindow - tableTop - paginationHeight - 2
      }px`;
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActionDropdown(null);
      }
    }
    if (actionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionDropdown]);

  const handleFinishExam = (patient: any) => {
    setSelectedPatient(patient);
    setShowRecordModal(true);
  };

  const handleAssignClinic = (patient: any) => {
    setSelectedPatient(patient);
    setShowResultModal(true);
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Dropdown chọn phòng khám */}
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="clinic-select" className="font-semibold">
          Phòng khám:
        </label>
        <select
          id="clinic-select"
          value={selectedClinic}
          onChange={(e) => setSelectedClinic(e.target.value)}
          className="border border-gray-300 rounded-md p-2 min-w-[200px]"
        >
          <option value="">Chọn phòng khám</option>
          {clinics.map((clinic: any) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </select>
      </div>
      {/* Search */}
      <div className="flex flex-col flex-1 mx-2 border border-gray-300 h-full overflow-visible">
        <div id="table-container" className="overflow-auto">
          <table id="table" className="w-full table-auto border-separate z-10">
            <thead className="bg-gray-100 sticky top-0 z-20">
              <tr>
                <th className="border border-gray-300 p-2">STT</th>
                <th className="border border-gray-300 p-2">Bệnh nhân</th>
                <th className="border border-gray-300 p-2">Trạng thái</th>
                <th className="border border-gray-300 p-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((queue, index) => (
                <tr key={queue.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 text-center p-2">
                    {index +
                      1 +
                      (pagination?.pageNumber - 1) * pagination?.pageSize}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {queue?.patient?.full_name}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {getQueueStatus(queue.status)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <div className="relative mx-auto w-10">
                      <button
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                        onClick={() =>
                          setActionDropdown(
                            actionDropdown === queue.id.toString()
                              ? null
                              : queue.id.toString()
                          )
                        }
                      >
                        <Ellipsis className="w-4 h-4" />
                      </button>
                      {actionDropdown === queue.id.toString() && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-30 top-full right-0 left-0 bg-white border border-gray-300 rounded shadow-md min-w-[140px] text-left"
                        >
                          {queue.status === "waiting" && (
                            <>
                              <button
                                className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                                onClick={async () => {
                                  await updateQueueStatus(
                                    queue.id.toString(),
                                    "in_progress"
                                  );
                                  setActionDropdown(null);
                                  fetchQueue(selectedClinic);
                                }}
                              >
                                Bắt đầu khám
                              </button>
                              <button
                                className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                                onClick={async () => {
                                  await updateQueueStatus(
                                    queue.id.toString(),
                                    "skipped"
                                  );
                                  setActionDropdown(null);
                                  fetchQueue(selectedClinic);
                                }}
                              >
                                Bỏ qua
                              </button>
                            </>
                          )}
                          {queue.status === "in_progress" && (
                            <button
                              className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                              onClick={() => handleFinishExam(queue.patient)}
                            >
                              Khám xong
                            </button>
                          )}
                          {/* Chỉ định khám thêm khi đang khám */}
                          {queue.status === "in_progress" && (
                            <button
                              className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                              onClick={() => handleAssignClinic(queue.patient)}
                            >
                              Chỉ định phòng tiếp
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div
          id="pagination"
          className="flex justify-between items-center gap-2 p-2 bg-white border-t border-gray-300"
        >
          <p className="text-sm text-gray-500">
            Hiển thị {(pagination?.pageNumber - 1) * pagination?.pageSize + 1}{" "}
            đến {pagination?.pageNumber * pagination?.pageSize} trên{" "}
            {totalElements} kết quả
          </p>
          <div className="flex items-center gap-2">
            <button
              className="border border-gray-300 bg-white px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() =>
                setPagination({
                  ...pagination,
                  pageNumber: pagination.pageNumber - 1,
                })
              }
              disabled={pagination.pageNumber === 1}
            >
              Trước
            </button>
            <button
              className="border border-gray-300 bg-white px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() =>
                setPagination({
                  ...pagination,
                  pageNumber: pagination.pageNumber + 1,
                })
              }
              disabled={pagination.pageNumber >= totalPages}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
      <ExaminationOrderModal
        open={showAssignModal && !!selectedPatient}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        clinics={clinics}
        selectedClinicId={selectedClinic}
        onSuccess={() => {
          setShowAssignModal(false);
          setSelectedPatient(null);
          fetchQueue(selectedClinic);
        }}
      />
      <ExaminationRecordModal
        open={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        patientId={selectedPatient?.id}
        doctorId={currentDoctorId}
        onSuccess={() => {
          setShowRecordModal(false);
          setSelectedPatient(null);
          fetchQueue(selectedClinic);
        }}
      />
      <ResultExaminationModal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        patientId={selectedPatient?.id}
        clinicId={Number(selectedClinic)}
        doctorId={currentDoctorId}
        currentUserId={user?.id}
        onSuccess={() => {
          setShowResultModal(false);
          setSelectedPatient(null);
          fetchQueue(selectedClinic);
        }}
      />
    </div>
  );
};

export default QueueTable;
