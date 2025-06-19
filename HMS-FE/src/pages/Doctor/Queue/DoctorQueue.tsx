import DoctorQueueTable from "./DoctorQueueTable";

const DoctorQueue = () => {
  return (
    <div className="flex flex-col bg-white rounded-t-3xl p-4 pb-0">
      <h2 className="text-indigo-600! text-2xl font-bold mb-3">
        Hàng chờ khám
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        <span className="text-indigo-600">Bác sĩ</span> &gt; Hàng chờ khám

      </p>
      <DoctorQueueTable />
    </div>
  );
};

export default DoctorQueue;
