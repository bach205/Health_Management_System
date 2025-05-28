import mainRequest from "@/api/mainRequest";
import { useQueueStore } from "@/store/queueStore";
import { toast } from "react-toastify";

const useQueue = () => {
  const { setQueues, setTotalElements, setTotalPages } = useQueueStore();
  const fetchQueue = async (clinicId: string) => {
    try {
      const response = await mainRequest.get(`/queues/${clinicId}`);
      setQueues(response.data.metadata.queueClinic);
      setTotalElements(response.data.metadata.total);
      setTotalPages(response.data.metadata.totalPages);
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
