import React, { useCallback, useEffect, useState } from "react";

import { Typography, Row, Col, Result, Select, Spin, Table } from "antd";
import { getClinicService } from "../../services/clinic.service";
import { getQueueClinic } from "../../services/queue.service";
import { useQueueStore } from "../../store/queueStore";
import useQueue from "../../hooks/useQueue";
import type { IQueue } from "../../types/queue.type";

const { Title, Text } = Typography;
const { Option } = Select;

type clicnicObject = {
    id : number,
    name : string,
    description : string,
}



const Monitor: React.FC = () => {
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [currentQueue, setCurrentQueue] = useState<IQueue[]>([]);
  const [loading, setLoading] = useState(false);
  const [clinic, setClinic] = useState<clicnicObject[]>([]);
  const [currentqueuenumber, setCurrentQueueuNumber] = useState<number | null>(null);
  const {
    queues,
    // pagination,
    // totalElements,
    // setPagination,
    // totalPages,
    // reset,
  } = useQueueStore();
  const { fetchQueue } = useQueue();
  useEffect(() => {
    const fetchClinics = async () => {
        const res = await getClinicService();
        setClinic(res.data?.metadata.clinics);
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    const getQueue = async () => {
      if(selectedClinic) {
        const response = await getQueueClinic(selectedClinic.toString());
        setCurrentQueue(response.metadata.queueClinic);
      }
    } 
    getQueue();
  }, [selectedClinic]);

  // Handler cho event
  // const handleStatusChanged = useCallback((data: any) => {
  //   console.log(data);
  //   if (data.queue.status === "in_progress") {
  //     setCurrentQueue({
  //       queue_number: data.queue.queue_number,
  //       shift_type: data.queue.shift_type || "",
  //       slot_date: data.queue.slot_date || "",
  //       slot_time: data.queue.appointment?.appointment_time || data.queue.slot_time || "",
  //       doctor_name: data.queue.appointment?.doctor?.full_name || data.queue.doctor?.full_name || "",
  //       clinic_name: data.queue.clinic?.name || "",
  //       patient_name: data.queue.patient?.user?.full_name || "Bệnh nhân",
  //     });
  //   }
  // }, [selectedClinic]);

  // // Khi chọn phòng khám, join đúng room socket
  // useSocket(
  //   selectedClinic ? `clinic_${selectedClinic}` : "",
  //   "queue:statusChanged",
  //   handleStatusChanged
  // );

  // Reset queue khi đổi phòng khám
  useEffect(() => {
    console.log(selectedClinic)
    console.log(currentQueue);
  }, [selectedClinic]);


  // Helper chuyển shift_type sang tiếng Việt
  const getShiftTypeText = (shift: string) => {
    switch (shift) {
      case "morning": return "Sáng";
      case "afternoon": return "Chiều";
      case "night": return "Tối";
      default: return shift;
    }
  };

  // Table columns
  const columns = [
    {
      title: "Số thứ tự",
      dataIndex: "queue_number",
      key: "queue_number",
      align: "center" as const,
      render: (text: any) => (
        <span style={{ color: "#1890ff", fontWeight: 700, fontSize: 28 }}>{text}</span>
      ),
    },
    {
      title: "Ca khám",
      dataIndex: "shift_type",
      key: "shift_type",
      align: "center" as const,
      render: (text: string) => getShiftTypeText(text),
    },
    {
      title: "Ngày khám",
      dataIndex: "slot_date",
      key: "slot_date",
      align: "center" as const,
      render: (text: string) => text?.slice(0, 10),
    },
    {
      title: "Bác sĩ",
      dataIndex: ["appointment", "doctor", "full_name"],
      key: "doctor_name",
      align: "center" as const,
      render: (_: any, record: any) => record.appointment?.doctor?.full_name || "",
    },
  ];

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col span={24}>
        <div
          style={{
            width: "100%",
            background: "#fff",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: 0,
            minHeight: "calc(100vh - 0px)",
            boxSizing: "border-box"
          }}
        >
          <Title level={2} style={{ textAlign: "center", color: "#1890ff", marginBottom: 32 }}>
            SỐ ĐANG ĐƯỢC GỌI
          </Title>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <Select
              showSearch
              placeholder="Chọn phòng khám"
              style={{ width: 300 }}
              value={selectedClinic !== null ? selectedClinic : undefined}
              onChange={val => setSelectedClinic(val)}
              optionLabelProp="children"
              filterOption={(input, option) =>
                (option?.children?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {clinic?.map(cli => (
                <Option key={cli.id} value={cli.id}>{cli.name}</Option>
              ))}
            </Select>
          </div>
          {!selectedClinic ? (
            <Result
              icon={<span role="img" aria-label="waiting" style={{ fontSize: 80, color: "#1890ff" }}>🏥</span>}
              title={<span style={{ color: "#1890ff" }}>Vui lòng chọn phòng khám</span>}
              subTitle="Chọn phòng khám để xem số thứ tự đang được gọi."
              style={{ padding: 0, margin: 0 }}
            />
          ) : loading ? (
            <div style={{ textAlign: "center", margin: 32 }}><Spin size="large" /></div>
          ) : currentQueue && currentQueue.length > 0 ? (
            <Table
              columns={columns}
              dataSource={currentQueue}
              rowKey="id"
              pagination={false}
              bordered
              style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}
            />
          ) : (
            <Result
              icon={<span role="img" aria-label="waiting" style={{ fontSize: 80, color: "#1890ff" }}>⏳</span>}
              title={<span style={{ color: "#1890ff" }}>Chưa có số nào đang được gọi</span>}
              subTitle="Vui lòng chờ đến lượt của bạn."
              style={{ padding: 0, margin: 0 }}
            />
          )}
        </div>
      </Col>
    </Row>
  );
};

export default Monitor; 