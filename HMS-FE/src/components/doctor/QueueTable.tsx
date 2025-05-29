import { useQueueStore } from "@/store/queueStore";
import { useEffect } from "react";

const QueueTable = () => {
  const { queues, pagination, totalElements, setPagination, totalPages } =
    useQueueStore();

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

  return (
    <div className="flex flex-col w-full h-full">
      {/* Search */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mx-2 my-2 items-center">
        <div className="flex flex-col gap-2 items-start">
          <label htmlFor="status">Trạng thái</label>
          {/* <select
            id="status"
            value={filter?.status || ""}
            onChange={(e) =>
              dispatch({
                type: "SET_FILTER",
                payload: { ...filter, status: e.target.value },
              })
            }
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Tất cả</option>
            {Object.values(BOOKING_STATUS).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select> */}
        </div>
      </div>
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
                    {queue.patient_name}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {queue.status}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <div className="relative dropdown-container flex items-center justify-center gap-2"></div>
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
              className="border border-gray-300 bg-white px-2 py-1 rounded-md hover:bg-gray-100"
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
              className="border border-gray-300 bg-white px-2 py-1 rounded-md hover:bg-gray-100"
              onClick={() =>
                setPagination({
                  ...pagination,
                  pageNumber: pagination.pageNumber + 1,
                })
              }
              disabled={pagination.pageNumber === totalPages}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueTable;
