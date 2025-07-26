import React, { useEffect, useMemo, useState } from "react";
import { Typography, Row, Col, Select, Spin, Table, Input, Tag, Button, Empty, DatePicker } from "antd";
import { getClinicService } from "../../services/clinic.service";
import { getQueueClinic } from "../../services/queue.service";
import dayjs from "dayjs";
import type { IQueue } from "../../types/queue.type";
import { SearchOutlined, ReloadOutlined, CalendarOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const shiftTypeOptions = [
  { value: "morning", label: "Sáng" },
  { value: "afternoon", label: "Chiều" },
  { value: "night", label: "Tối" },
];

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "waiting", label: "Chờ khám" },
  { value: "in_progress", label: "Đang khám" },
  { value: "done", label: "Đã khám" },
  { value: "skipped", label: "Bỏ qua" },
];

const getShiftTypeText = (shift: string) => {
  switch (shift) {
    case "morning": return "Sáng";
    case "afternoon": return "Chiều";
    case "night": return "Tối";
    default: return shift;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "waiting": return "gold";
    case "in_progress": return "blue";
    case "done": return "green";
    case "skipped": return "red";
    default: return "default";
  }
};

const Monitor: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [queueData, setQueueData] = useState<IQueue[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [status, setStatus] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [doctor, setDoctor] = useState("");
  const [queueNumber, setQueueNumber] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());

  // Fetch clinics
  useEffect(() => {
    const fetchClinics = async () => {
      setLoading(true);
      try {
        const res = await getClinicService();
        setClinics(res.data?.metadata.clinics || []);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // Fetch queue data from API (status, paging)
  const fetchQueue = async (clinicId: number, page = 1, pageSize = 10, status = "", date = dayjs()) => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const res = await getQueueClinic(clinicId.toString(), {
        pageNumber: page,
        pageSize,
      }, status || undefined);

      // Filter by selected date on frontend
      let filteredQueue = res.metadata.queueClinic || [];
      // if (date) {
      //   filteredQueue = filteredQueue.filter((item: IQueue) => {
      //     const itemDate = dayjs(item.slot_date);
      //     return itemDate.isSame(date, 'day');
      //   });
      // }

      setQueueData(filteredQueue);
      setPagination({
        current: page,
        pageSize,
        total: filteredQueue.length,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch queue when clinic, status, page, or date changes
  useEffect(() => {
    if (selectedClinic) {
      fetchQueue(selectedClinic, pagination.current, pagination.pageSize, status, selectedDate);
    } else {
      setQueueData([]);
      setPagination({ current: 1, pageSize: 10, total: 0 });
    }
    // eslint-disable-next-line
  }, [selectedClinic, status, pagination.current, pagination.pageSize, selectedDate]);

  // Lấy danh sách bác sĩ từ queueData
  const doctorOptions = useMemo(() => {
    const doctors = queueData.map(q => q.appointment?.doctor?.full_name).filter(Boolean);
    return Array.from(new Set(doctors)).map(name => ({ value: name, label: name }));
  }, [queueData]);

  // Lọc phía FE cho các trường còn lại
  const filteredData = useMemo(() => {
    let data = queueData;
    if (shiftType) data = data.filter(q => q.shift_type === shiftType);
    if (doctor) data = data.filter(q => q.appointment?.doctor?.full_name === doctor);
    if (queueNumber) data = data.filter(q => String(q.queue_number).includes(queueNumber));
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(q =>
        String(q.queue_number).includes(s) ||
        (q.appointment?.doctor?.full_name || "").toLowerCase().includes(s) ||
        (q.shift_type || "").toLowerCase().includes(s) ||
        (q.status || "").toLowerCase().includes(s)
      );
    }
    return data;
  }, [queueData, shiftType, doctor, queueNumber, search]);

  // Table columns
  const columns = [
    {
      title: "Số thứ tự",
      dataIndex: "queue_number",
      key: "queue_number",
      align: "center" as const,
      width: 100,
      render: (val: any) => <b style={{ color: "#1890ff", fontSize: 20 }}>{val}</b>,
    },
    {
      title: "Ca khám",
      dataIndex: "shift_type",
      key: "shift_type",
      align: "center" as const,
      width: 100,
      render: (val: string) => getShiftTypeText(val),
    },
    {
      title: "Ngày Đặt Lịch",
      dataIndex: "slot_date",
      key: "slot_date",
      align: "center" as const,
      width: 120,
      render: (val: string) => val ? dayjs(val).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Bác sĩ",
      dataIndex: ["appointment", "doctor", "full_name"],
      key: "doctor",
      align: "center" as const,
      width: 200,
      render: (_: any, record: any) => record.appointment?.doctor?.full_name || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      width: 120,
      render: (val: string) => <Tag color={getStatusColor(val)}>{statusOptions.find(s => s.value === val)?.label || val}</Tag>,
    },
  ];

  // Xử lý chuyển trang
  const handleTableChange = (pag: any) => {
    setPagination({ ...pagination, current: pag.current, pageSize: pag.pageSize });
  };

  // Reset filter
  const resetFilters = () => {
    setStatus("");
    setShiftType("");
    setDoctor("");
    setQueueNumber("");
    setSearch("");
    setSelectedDate(dayjs());
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Col span={24}>
        <div
          style={{
            width: "100%",
            background: "#fff",
            borderRadius: 32,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: 40,
            margin: 0,
            minHeight: "calc(100vh - 0px)",
            boxSizing: "border-box",
            maxWidth: 1100,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Title level={2} style={{ textAlign: "center", color: "#1890ff", marginBottom: 32 }}>
            HÀNG CHỜ PHÒNG KHÁM
          </Title>
          <div style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <Select
              showSearch
              placeholder="Chọn phòng khám"
              style={{ width: 220 }}
              value={selectedClinic !== null ? selectedClinic : undefined}
              onChange={val => setSelectedClinic(val)}
              optionLabelProp="children"
              filterOption={(input, option) =>
                (option?.children?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
              }
              disabled={loading}
            >
              {clinics?.map(cli => (
                <Option key={cli.id} value={cli.id}>{cli.name}</Option>
              ))}
            </Select>
            <DatePicker
              placeholder="Chọn ngày"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date || dayjs())}
              format="DD/MM/YYYY"
              style={{ width: 140 }}
              disabled={!selectedClinic}
              suffixIcon={<CalendarOutlined />}
            />
            <Select
              placeholder="Trạng thái"
              style={{ width: 140 }}
              value={status}
              onChange={val => setStatus(val)}
              options={statusOptions}
              allowClear
              disabled={!selectedClinic}
            />
            <Select
              placeholder="Ca khám"
              style={{ width: 120 }}
              value={shiftType}
              onChange={val => setShiftType(val)}
              options={[{ value: "", label: "Tất cả" }, ...shiftTypeOptions]}
              allowClear
              disabled={!selectedClinic}
            />
            <Select
              showSearch
              placeholder="Bác sĩ"
              style={{ width: 180 }}
              value={doctor}
              onChange={val => setDoctor(val)}
              options={[{ value: "", label: "Tất cả" }, ...doctorOptions]}
              allowClear
              disabled={!selectedClinic}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
            <Input
              placeholder="Số thứ tự"
              value={queueNumber}
              onChange={e => setQueueNumber(e.target.value)}
              style={{ width: 120 }}
              disabled={!selectedClinic}
            />
            <Input
              placeholder="Tìm kiếm nhanh"
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<SearchOutlined />}
              style={{ width: 180 }}
              disabled={!selectedClinic}
            />
            <Button icon={<ReloadOutlined />} onClick={resetFilters} disabled={!selectedClinic}>
              Đặt lại
            </Button>
          </div>
          <div style={{ minHeight: 400 }}>
            {!selectedClinic ? (
              <Empty description="Vui lòng chọn phòng khám để xem hàng chờ." style={{ marginTop: 60 }} />
            ) : loading ? (
              <div style={{ textAlign: "center", margin: 60 }}><Spin size="large" /></div>
            ) : (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredData}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 20, 50],
                  showTotal: (total) => `Tổng cộng ${total} hàng chờ`,
                }}
                onChange={handleTableChange}
                bordered
                size="middle"
                scroll={{ x: 900, y: 400 }}
                locale={{ emptyText: <Empty description="Không có dữ liệu phù hợp" /> }}
              />
            )}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Monitor; 