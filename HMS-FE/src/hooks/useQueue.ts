import { getQueueClinic } from "@/services/queue.service";
import { useQueueStore } from "@/store/queueStore";
import { toast } from "react-toastify";

const useQueue = () => {
  const { setQueues, setTotalElements, setTotalPages } = useQueueStore();
  const fetchQueue = async (clinicId: string) => {
    try {
      const response = await getQueueClinic(clinicId);
      setQueues(response.metadata.queueClinic);
      setTotalElements(response.metadata.total);
      setTotalPages(response.metadata.totalPages);
    } catch (error: any) {
      toast.error(
        error.response.data.message || "Lỗi khi lấy danh sách hàng chờ"
      );
    }
  };

  return {
    fetchQueue,
  };
};

export default useQueue;
