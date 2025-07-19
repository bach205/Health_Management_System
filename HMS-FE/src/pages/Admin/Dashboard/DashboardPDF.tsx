import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
} from '@react-pdf/renderer';
import RobotoVietnam from '../../../fonts/Roboto-Regular.ttf';
import RobotoVietnamBold from '../../../fonts/Roboto-Bold.ttf';
import type { IRevenuePerMonth } from './AdminDashboard';

Font.register({ family: 'RobotoVietnam', src: RobotoVietnam });
Font.register({ family: 'RobotoVietnamBold', src: RobotoVietnamBold });

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: 'RobotoVietnam' },
    title: { fontSize: 16, fontFamily: 'RobotoVietnamBold', marginBottom: 12, textAlign: 'center' },
    section: { marginBottom: 12 },
    label: { fontFamily: 'RobotoVietnamBold' },
    tableHeader: { flexDirection: 'row', borderBottom: 1, paddingBottom: 4, marginBottom: 4 },
    tableRow: { flexDirection: 'row', paddingBottom: 2 },
    cell: { flex: 1 },
});

const formatPrice = (value: number) =>
    value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
    });

interface IProps {
    statistics: {
        totalExamination: number;
        totalAppointments: number;
        totalCancel: number;
        totalPatientUnder20: number;
        totalPatient2040: number;
        totalPatient40: number;
        totalAppointmentsInWeek: number[]; // length = 7
    };
    periodStatistics: {
        totalAppointments: number;
        totalRevenue: number;
        totalPatients: number;
    };
    topDoctors: any[];
    periodLabel: string;
    revenueYearData: IRevenuePerMonth[];

}
const HEADER_IMAGE = '/src/assets/prjLogo.png'

const DashboardPDF = ({ statistics, topDoctors, periodLabel, revenueYearData, periodStatistics }: IProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Image
                src={HEADER_IMAGE}
                style={{ width: 150, height: 50, marginBottom: 10 }}
            />
            <Text style={styles.title}>Tổng kết thống kê </Text>

            <View style={styles.section}>
                <Text><Text style={styles.label}>Tổng ca đặt lịch {periodLabel}:</Text> {periodStatistics.totalAppointments} ca</Text>
                <Text><Text style={styles.label}>Tổng doanh thu {periodLabel}:</Text> {formatPrice(periodStatistics.totalRevenue)}</Text>
                <Text><Text style={styles.label}>Tổng bệnh nhân mới {periodLabel}:</Text> {periodStatistics.totalPatients} người</Text>
            </View>

            <View style={styles.section}>
                <Text style={{ ...styles.label, marginBottom: 6 }}>Doanh thu theo tháng:</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.cell}>Tháng</Text>
                    <Text style={styles.cell}>Doanh thu (VND)</Text>
                </View>
                {revenueYearData.map((item, index) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={styles.cell}>{item.month}</Text>
                        <Text style={styles.cell}>{formatPrice(item.value)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={{ ...styles.label, marginBottom: 6 }}>Top bác sĩ được đặt lịch nhiều:</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.cell}>Tên</Text>
                    <Text style={styles.cell}>Chuyên khoa</Text>
                    <Text style={styles.cell}>Số lượt đặt lịch</Text>
                </View>
                {topDoctors.map((doc, index) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={styles.cell}>{doc.full_name}</Text>
                        <Text style={styles.cell}>{doc.specialty || 'Không rõ'}</Text>
                        <Text style={styles.cell}>{doc.appointmentCount}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={{ ...styles.label, marginBottom: 6 }}>Thống kê chi tiết:</Text>
                <Text>Số lượt khám trực tiếp: {statistics.totalExamination} ca</Text>
                <Text>Số lượt khám từ xa: {statistics.totalAppointments} ca</Text>
                <Text>Số lượt hủy: {statistics.totalCancel} ca</Text>
                <Text>Bệnh nhân dưới 20 tuổi: {statistics.totalPatientUnder20} người</Text>
                <Text>Bệnh nhân từ 20 đến 40 tuổi: {statistics.totalPatient2040} người</Text>
                <Text>Bệnh nhân từ 40 tuổi trở lên: {statistics.totalPatient40} người</Text>
            </View>
            <View style={styles.section}>
                <Text style={{ ...styles.label, marginBottom: 6 }}>Lượt đặt lịch theo thứ trong tuần:</Text>
                {statistics.totalAppointmentsInWeek.map((count, index) => (
                    <Text key={index}>Thứ {index === 0 ? 'Chủ nhật' : index}: {count} lượt</Text>
                ))}
            </View>

        </Page>
    </Document>
);

export default DashboardPDF;
