import React, { useEffect, useState } from "react";
import {
  Layout, Row, Col, Card, Flex, Select, Table, Typography, Divider, message,
  Avatar,
  Button,
  Skeleton,
} from "antd";
import { CircleDollarSign, ClipboardPlus, Download, UserPlus, UserRound } from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement } from "chart.js";
import dayjs from "dayjs";
import { getPeriodStatistics, getTopDoctors, getRevenuePerDayInMonth, getRevenuePerMonthInYear, getTotalStatistics } from "../../../services/statistics.service";
import type { IDoctor } from "../../../types/index.type";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DashboardPDF from "./DashboardPDF";
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);



const DATE_MODE = {
  today: "hôm nay",
  week: "tuần này",
  month: "tháng này",
  year: "năm nay",
};

export interface IRevenuePerMonth {
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
  const [date, setDate] = useState<DateModeKey>("year");

  const [loading, setLoading] = useState(false);
  const [periodStatistics, setPeriodStatistics] = useState({
    totalAppointments: 0,
    totalRevenue: 0,
    totalPatients: 0,
  });

  const [statistics, setStatistics] = useState({
    totalAppointments: 0,
    totalExamination: 0,
    totalCancel: 0,
    totalPatientUnder20: 0,
    totalPatient2040: 0,
    totalPatient40: 0,
    totalAppointmentsInWeek: [] as number[]
  });

  // console.log("statistics",statistics)
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [revenueYearData, setRevenueYearData] = useState<IRevenuePerMonth[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statRes = await getPeriodStatistics(date as "daily" | "weekly" | "monthly" | "yearly");
      const doctorRes = await getTopDoctors();
      const yearRes = await getRevenuePerMonthInYear(dayjs().year());
      const totalRes = await getTotalStatistics();
      setPeriodStatistics(statRes.data.metadata);
      setTopDoctors(doctorRes.data.metadata);
      setRevenueYearData(yearRes.data.metadata);
      setStatistics(totalRes.data.metadata);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu thống kê");
      console.error(err);
    } finally {
      setLoading(false);
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
      render: (url: string) => url ? (
        <img
          src={url}
          alt="doctor"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
          <UserRound className="w-5 h-5" color="gray" />

        </div>
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
      render: (specialty: any) => specialty || "Chưa rõ",
    },
    {
      title: "Số lượt đặt lịch",
      dataIndex: "appointmentCount",
      key: "appointmentCount",
      align: "center",
    },
  ];



  // tổng đặt lịch theo thứ trong tuần
  const barChartData = {
    labels: statistics.totalAppointmentsInWeek.map((item, index) => index === 0 ? "Chủ nhật" : `Thứ ${index + 1}`),
    datasets: [
      {
        label: "Tổng đặt lịch",
        data: statistics.totalAppointmentsInWeek.map((item: any) => item),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgb(75, 192, 192)",
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };


  const lineChartData = {
    labels: revenueYearData.map((item) => item.month),
    datasets: [
      {
        label: "Doanh thu",
        data: revenueYearData.map((item) => item.value),
        backgroundColor: "#6366f1",
      },
    ],
  };

  const pieChartAppointmentsData = {
    labels: ["Đặt lịch", "Khám trực tiếp", "Hủy lịch"],
    datasets: [
      {
        data: [statistics.totalAppointments, statistics.totalExamination, statistics.totalCancel],
        backgroundColor: ["#6366f1", "#3b82f6", "#ef4444"],
      },
    ],
  };

  const pieChartPatientsData = {
    labels: ["Dưới 20 tuổi", "20 - 40 tuổi", "Trên 40 tuổi"],
    datasets: [
      {
        data: [statistics.totalPatientUnder20, statistics.totalPatient2040, statistics.totalPatient40],
        backgroundColor: ["#6366f1", "#3b82f6", "#ef4444"],
      },
    ],
  };


  const lineChartOptions = {
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
        beginAtZero: true,
        ticks: {

          callback: (val: any) => formatPrice(val),

        },
      },

    },
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 bg-white rounded-2xl">
      <h2 className="text-indigo-600 text-2xl font-bold mb-3">Tổng kết thống kê</h2>
      <p className="text-gray-500 text-sm mb-5">
        <span className="text-indigo-600">Quản lý</span> &gt; Tổng kết thống kê
      </p>
      <Flex align="center" justify="space-between" gap={10} className="w-full">
        <Flex align="center" gap={10}>
          <Typography.Text>Chọn ngày:</Typography.Text>
          <Select value={date} onChange={setDate} style={{ width: 200 }}>
            <Select.Option value="today">Hôm nay</Select.Option>
            <Select.Option value="week">Tuần này</Select.Option>
            <Select.Option value="month">Tháng này</Select.Option>
            <Select.Option value="year">Năm nay</Select.Option>
          </Select>
        </Flex>
        <div className="" >

          <PDFDownloadLink
            document={
              <DashboardPDF statistics={statistics} periodStatistics={periodStatistics} topDoctors={topDoctors} periodLabel={DATE_MODE[date]} revenueYearData={revenueYearData} />
            }
            fileName={`thong-ke-${DATE_MODE[date]}.pdf`}
          >
            {({ loading }) => (
              <Button type="primary" icon={<Download className="w-4 h-4" />} loading={loading}>
                Xuất PDF
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </Flex>
      <Divider />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={8}>
          <Skeleton loading={loading} active round>
            <Card title={`Tổng ca đặt lịch ${DATE_MODE[date]}`} variant="outlined">
              <div className="flex items-center gap-1">
                <ClipboardPlus className="w-9 h-9 inline mr-2" />
                <span style={{ fontSize: 24 }}>{periodStatistics.totalAppointments}</span>
                <span style={{ fontSize: 16 }}> ca</span>
              </div>
            </Card>
          </Skeleton>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Skeleton loading={loading} active round>
            <Card title={`Tổng doanh thu ${DATE_MODE[date]}`} variant="outlined">
              <div className="flex items-center gap-1">
              <CircleDollarSign className="w-9 h-9 inline mr-2" />
                <span style={{ fontSize: 24 }}>{formatPrice(periodStatistics.totalRevenue)}</span>
              </div>
            </Card>
          </Skeleton>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Skeleton loading={loading} active round>
            <Card title={`Tổng bệnh nhân mới ${DATE_MODE[date]}`} variant="outlined">
              <div className="flex items-center gap-1">
                <UserPlus className="w-9 h-9 inline mr-2" />
                <span style={{ fontSize: 24 }}>{periodStatistics.totalPatients}</span>
              <span style={{ fontSize: 16 }}> bệnh nhân</span>
              </div>
            </Card>
          </Skeleton>
        </Col>
      </Row>

      {/* <Skeleton loading={loading} active round> */}
        <Card title="Danh sách bác sĩ được đặt lịch nhiều nhất" style={{ marginTop: 24 }}>
          <Table
            rowKey="id"
            columns={topDoctorsColumns}
            dataSource={topDoctors}
            loading={loading}
            pagination={false}
          />
        </Card>
      {/* </Skeleton> */}

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>

        <Col xs={24} sm={24} md={12}>
          <Skeleton loading={loading} active round>
            <Card
              title={`Biểu đồ doanh thu theo tháng trong năm ${dayjs().year()}`}
              style={{ height: 400 }}
          >
              <Line data={lineChartData} options={lineChartOptions} />
            </Card>
          </Skeleton>
        </Col>

        {/* // tổng đặt lịch theo thứ trong tuần */}
        <Col xs={24} sm={24} md={12}>
          <Skeleton loading={loading} active round>
            <Card
              title={`Biểu đồ tổng ca đặt lịch theo thứ trong tuần`}
              style={{ height: 400 }}
            >
              <Bar data={barChartData} options={barChartOptions} />
            </Card>
          </Skeleton>
        </Col>

        <Col xs={24} sm={24} md={12}>
          <Skeleton loading={loading} active round>
            <Card
              title={`Biểu đồ tổng ca đặt lịch, khám trực tiếp, hủy lịch`}
            >
              <Pie data={pieChartAppointmentsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Chart.js Pie Chart'
                  }
                },

              }} />
            </Card>
          </Skeleton>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Skeleton loading={loading} active round>
            <Card
            title={`Biểu đồ tổng bệnh nhân theo tuổi`}
          >
              <Pie data={pieChartPatientsData} />
            </Card>
          </Skeleton>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
