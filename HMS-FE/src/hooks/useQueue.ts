import { getQueueClinic } from "../services/queue.service";
import { useQueueStore } from "../store/queueStore";
import { toast } from "react-toastify";

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

const useQueue = () => {
  const { setQueues, setTotalElements, setTotalPages, queues } = useQueueStore();

  const fetchQueue = async (clinicId: string, pagination?: PaginationParams, type?: string) => {
    try {
      if (type === "") {
        type = undefined; 
      }
      console.log("Fetching queue for clinic:", clinicId, "with pagination:", pagination, "and type:", type);
      const response = await getQueueClinic(clinicId, pagination, type);
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
