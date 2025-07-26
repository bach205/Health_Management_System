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
      const data = response.metadata.queueClinic.filter(item => {
            const now = new Date();
            const slotDate = new Date(item.slot_date);
            
            // So sánh ngày theo UTC
            // if (
            //   slotDate.getUTCFullYear() === now.getUTCFullYear() &&
            //   slotDate.getUTCMonth() === now.getUTCMonth() &&
            //   slotDate.getUTCDate() === now.getUTCDate()
            // ) {
         
            //   // slot hôm nay, chỉ hiện nếu giờ bắt đầu > giờ hiện tại
            //   const slotStart = new Date(item.appointment.appointment_time);
            //   return slotStart.getUTCHours() >= now.getHours() ||
            //     (slotStart.getUTCHours() === now.getHours() && slotStart.getUTCMinutes() > now.getMinutes());
            // }
            // slot ngày khác, luôn hiện
            return (slotDate.getUTCFullYear() >= now.getUTCFullYear() &&
              slotDate.getUTCMonth() >= now.getUTCMonth() &&
              slotDate.getUTCDate() >= now.getUTCDate());
      })
      console.log(data);
      setQueues(data);
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
