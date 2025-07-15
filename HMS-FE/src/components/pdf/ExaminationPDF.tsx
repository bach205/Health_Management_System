import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font
} from '@react-pdf/renderer';
import RobotoVietnam from '../../fonts/Roboto-Regular.ttf';
Font.register({
  family: 'RobotoVietnam',
  src: RobotoVietnam,
});


// Optional: Embed Vietnamese font if needed (e.g. Roboto)
// Font.register({ family: 'Roboto', src: 'https://...' });

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: 'RobotoVietnam' },
    section: { marginBottom: 10 },
    label: { fontWeight: 'bold' },
    title: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
    tableHeader: { flexDirection: 'row', borderBottom: 1, marginBottom: 4 },
    tableRow: { flexDirection: 'row', borderBottom: 0.5 },
    cell: { flex: 1, padding: 2 }
});

const ExaminationPDF = ({ record }: { record: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Kết quả khám bệnh</Text>

            <View style={styles.section}>
                <Text><Text style={styles.label}>Phòng khám: </Text>{record.clinic?.name || 'Chưa rõ'}</Text>
                <Text><Text style={styles.label}>Bác sĩ: </Text>{record.doctor?.full_name || 'Chưa rõ'}</Text>
                <Text><Text style={styles.label}>Ngày khám: </Text>{record.examined_at}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Kết quả khám:</Text>
                <Text>{record.result}</Text>
            </View>

            {record.note && (
                <View style={styles.section}>
                    <Text style={styles.label}>Ghi chú:</Text>
                    <Text>{record.note}</Text>
                </View>
            )}

            {record.prescriptionItems?.length > 0 && (
                <View style={styles.section}>
                    <Text style={{ ...styles.label, marginBottom: 4 }}>Đơn thuốc:</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.cell}>Tên thuốc</Text>
                        <Text style={styles.cell}>Liều lượng</Text>
                        <Text style={styles.cell}>Tần suất</Text>
                        <Text style={styles.cell}>Thời gian</Text>
                    </View>
                    {record.prescriptionItems.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.cell}>{item.medicine?.name || 'Không rõ'}</Text>
                            <Text style={styles.cell}>{item.dosage || '-'}</Text>
                            <Text style={styles.cell}>{item.frequency || '-'}</Text>
                            <Text style={styles.cell}>{item.duration || '-'}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Page>
    </Document>
);

export default ExaminationPDF;
