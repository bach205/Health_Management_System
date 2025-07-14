import React, { useEffect, useState } from "react";
import {
  Layout, Row, Col, Card, Flex, Select, Table, Typography, Divider
} from "antd";
import { CircleDollarSign, ClipboardPlus, UserPlus } from "lucide-react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const { Content } = Layout;

const DATE_MODE = {
  today: "hôm nay",
  week: "tuần này",
  month: "tháng này",
  year: "năm nay",
};
type DateModeKey = keyof typeof DATE_MODE;

const formatPrice = (value: number) =>
  value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const listTopDoctor = [
  {
    _id: "1",
    full_name: "BS. Nguyễn Văn A",
    specialty: "Nội tổng hợp",
    totalAppointments: 120,
    avatar: "https://placehold.jp/150x150.png",
  },
  {
    _id: "2",
    full_name: "BS. Trần Thị B",
    specialty: "Tai - Mũi - Họng",
    totalAppointments: 110,
    avatar: "https://placehold.jp/150x150.png",
  },
  {
    _id: "3",
    full_name: "BS. Lê Văn C",
    specialty: "Tim mạch",
    totalAppointments: 105,
    avatar: "https://placehold.jp/150x150.png",
  },
  {
    _id: "4",
    full_name: "BS. Phạm Thị D",
    specialty: "Nhi khoa",
    totalAppointments: 97,
    avatar: "https://placehold.jp/150x150.png",
  },
];

const AdminDashboard = () => {
  const [date, setDate] = useState<DateModeKey>("today");

  const fakeChartMonth = Array.from({ length: dayjs().daysInMonth() }, (_, i) => ({
    day: `${i + 1}/${dayjs().month() + 1}`,
    value: Math.floor(Math.random() * 5_000_000) + 500_000,
  }));

  const fakeChartYear = Array.from({ length: 12 }, (_, i) => ({
    month: `Tháng ${i + 1}`,
    value: Math.floor(Math.random() * 50_000_000) + 10_000_000,
  }));

  const lineChartData = {
    labels: fakeChartMonth.map((item) => item.day),
    datasets: [
      {
        label: "Doanh thu",
        data: fakeChartMonth.map((item) => item.value),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const barChartData = {
    labels: fakeChartYear.map((item) => item.month),
    datasets: [
      {
        label: "Doanh thu",
        data: fakeChartYear.map((item) => item.value),
        backgroundColor: "#6366f1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => formatPrice(context.raw),
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val: any) => formatPrice(val),
        },
      },
    },
  };

  const topDoctorsColumns: any = [
    {
      title: "Ảnh",
      dataIndex: "avatar",
      key: "avatar",
      render: (url: string) => (
        <img
          src={url}
          alt="doctor"
          style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "Số lượt đặt lịch",
      dataIndex: "totalAppointments",
      key: "totalAppointments",
      align: "center",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl">
      <h2 className="text-indigo-600 text-2xl font-bold mb-3">Tổng kết thống kê</h2>
      <p className="text-gray-500 text-sm mb-5">
        <span className="text-indigo-600">Quản lý</span> &gt; Tổng kết thống kê
      </p>
      <Flex align="center" gap={10}>
        <Typography.Text>Chọn ngày:</Typography.Text>
        <Select value={date} onChange={setDate} style={{ width: 200 }}>
          <Select.Option value="today">Hôm nay</Select.Option>
          <Select.Option value="week">Tuần này</Select.Option>
          <Select.Option value="month">Tháng này</Select.Option>
          <Select.Option value="year">Năm nay</Select.Option>
        </Select>
      </Flex>
      <Divider />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={8}>
          <Card title={`Tổng ca đặt lịch ${DATE_MODE[date]}`} variant="outlined">
            <div className="flex items-center gap-1">
              <ClipboardPlus className="w-9 h-9 inline mr-2" />
              <span style={{ fontSize: 24 }}>100</span>
              <span style={{ fontSize: 16 }}> ca</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card title={`Tổng doanh thu ${DATE_MODE[date]}`} variant="outlined">
            <div className="flex items-center gap-1">
              <CircleDollarSign className="w-9 h-9 inline mr-2" />
              <span style={{ fontSize: 24 }}>{formatPrice(99999999)}</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card title={`Tổng bệnh nhân mới ${DATE_MODE[date]}`} variant="outlined">
            <div className="flex items-center gap-1">
              <UserPlus className="w-9 h-9 inline mr-2" />
              <span style={{ fontSize: 24 }}>100</span>
              <span style={{ fontSize: 16 }}> bệnh nhân</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách bác sĩ được đặt lịch nhiều nhất" style={{ marginTop: 24 }}>
        <Table
          rowKey="_id"
          columns={topDoctorsColumns}
          dataSource={listTopDoctor}
          pagination={false}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={24} md={12}>
          <Card
            title={`Biểu đồ doanh thu theo ngày trong tháng ${dayjs().month() + 1}`}
            style={{ height: 400 }}
          >
            <Line data={lineChartData} options={chartOptions} />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Card
            title={`Biểu đồ doanh thu theo tháng trong năm ${dayjs().year()}`}
            style={{ height: 400 }}
          >
            <Bar data={barChartData} options={chartOptions} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
