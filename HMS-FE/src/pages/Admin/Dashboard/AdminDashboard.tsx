import React, { useEffect, useState } from "react";
import {
  Layout, Row, Col, Card, Flex, Select, Table, Typography, Divider, message,
} from "antd";
import { CircleDollarSign, ClipboardPlus, UserPlus } from "lucide-react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";
import { getPeriodStatistics, getTopDoctors, getRevenuePerDayInMonth, getRevenuePerMonthInYear, } from "../../../services/statistics.service";
import type { IDoctor } from "../../../types/index.type";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const DATE_MODE = {
  today: "hôm nay",
  week: "tuần này",
  month: "tháng này",
  year: "năm nay",
};

interface IRevenuePerDay {
  day: string,
  value: number,
}

interface IRevenuePerMonth {
  month: string,
  value: number,
}
type DateModeKey = keyof typeof DATE_MODE;

const formatPrice = (value: number) =>
  value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const AdminDashboard = () => {
  const [date, setDate] = useState<DateModeKey>("today");
  const [statistics, setStatistics] = useState({
    totalAppointments: 0,
    totalRevenue: 0,
    totalPatients: 0,
  });
  const [topDoctors, setTopDoctors] = useState<IDoctor[]>([]);
  const [revenueMonthData, setRevenueMonthData] = useState<IRevenuePerDay[]>([]);
  const [revenueYearData, setRevenueYearData] = useState<IRevenuePerMonth[]>([]);

  const fetchData = async () => {
    try {
      const statRes = await getPeriodStatistics(date as "daily" | "weekly" | "monthly" | "yearly");
      const doctorRes = await getTopDoctors();
      const monthRes = await getRevenuePerDayInMonth(dayjs().year(), dayjs().month() + 1);
      const yearRes = await getRevenuePerMonthInYear(dayjs().year());

      setStatistics(statRes.data.metadata);
      setTopDoctors(doctorRes.data.metadata);
      setRevenueMonthData(monthRes.data.metadata);
      setRevenueYearData(yearRes.data.metadata);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu thống kê");
      console.error(err);
    }
  };


  useEffect(() => {
    fetchData();
  }, [date]);

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
      dataIndex: "appointmentCount",
      key: "appointmentCount",
      align: "center",
    },
  ];

  const lineChartData = {
    labels: revenueMonthData.map((item) => item.day),
    datasets: [
      {
        label: "Doanh thu",
        data: revenueMonthData.map((item) => item.value),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const barChartData = {
    labels: revenueYearData.map((item) => item.month),
    datasets: [
      {
        label: "Doanh thu",
        data: revenueYearData.map((item) => item.value),
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
              <span style={{ fontSize: 24 }}>{statistics.totalAppointments}</span>
              <span style={{ fontSize: 16 }}> ca</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card title={`Tổng doanh thu ${DATE_MODE[date]}`} variant="outlined">
            <div className="flex items-center gap-1">
              <CircleDollarSign className="w-9 h-9 inline mr-2" />
              <span style={{ fontSize: 24 }}>{formatPrice(statistics.totalRevenue)}</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card title={`Tổng bệnh nhân mới ${DATE_MODE[date]}`} variant="outlined">
            <div className="flex items-center gap-1">
              <UserPlus className="w-9 h-9 inline mr-2" />
              <span style={{ fontSize: 24 }}>{statistics.totalPatients}</span>
              <span style={{ fontSize: 16 }}> bệnh nhân</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách bác sĩ được đặt lịch nhiều nhất" style={{ marginTop: 24 }}>
        <Table
          rowKey="id"
          columns={topDoctorsColumns}
          dataSource={topDoctors}
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
