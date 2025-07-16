import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image
} from '@react-pdf/renderer';
import RobotoVietnam from '../../fonts/Roboto-Regular.ttf';
import RobotoVietnamBold from '../../fonts/Roboto-Bold.ttf';

import dayjs from 'dayjs';

Font.register({
    family: 'RobotoVietnam',
    src: RobotoVietnam,
});

Font.register({
    family: 'RobotoVietnamBold',
    src: RobotoVietnamBold,
});

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: 'RobotoVietnam', fontWeight: 'bold' },
    section: { marginBottom: 10 },
    label: { fontWeight: 'bold', fontFamily: 'RobotoVietnamBold', fontSize: 14 },
    title: { fontFamily: 'RobotoVietnamBold', fontSize: 16, marginBottom: 10, textAlign: 'center' },
    tableHeader: { flexDirection: 'row', borderBottom: 1, marginBottom: 4 },
    tableRow: { flexDirection: 'row', borderBottom: 0.5 },
    cell: { flex: 1, padding: 2 }
});

const HEADER_IMAGE = '/src/assets/prjLogo.png'

const ExaminationPDF = ({ record }: { record: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Image
                src={HEADER_IMAGE}
                style={{ width: 150, height: 50, marginBottom: 10 }}
            />
            <Text style={styles.title}>Kết quả khám bệnh</Text>
            <View style={styles.section}>
                <View style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'center' }}>
                    <Text style={styles.label}>Họ và tên bệnh nhân: </Text>
                    <Text>{record.patient?.user?.full_name || 'Chưa rõ'}</Text>
                    <Text style={{ flex: 1 }} />
                    <Text style={styles.label}>Giới tính: </Text>
                    <Text>{record.patient?.user?.gender === 'male' ? 'Nam' : record.patient?.user?.gender === 'female' ? 'Nữ' : 'Không rõ'}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'center' }}>
                    <Text style={styles.label}>Số điện thoại: </Text>
                    <Text>{record.patient?.user?.phone || 'Không có'}</Text>
                    <Text style={{ flex: 1 }} />
                    <Text style={styles.label}>Ngày sinh: </Text>
                    <Text>{record.patient?.user?.date_of_birth ? dayjs(record.patient.user.date_of_birth).format('DD/MM/YYYY') : 'Không rõ'}</Text>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Text style={styles.label}>Địa chỉ: </Text>
                    <Text>{record.patient?.user?.address || 'Không rõ'}</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text><Text style={styles.label}>Tại phòng khám: </Text>{record.clinic?.name || 'Chưa rõ'}</Text>
                <Text><Text style={styles.label}>Bác sĩ: </Text>{record.doctor?.user?.full_name || 'Chưa rõ'}</Text>
                <Text><Text style={styles.label}>Ngày khám: </Text>{dayjs(record.examined_at).format("HH:mm DD/MM/YYYY")}</Text>
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
                    <Text style={{ ...styles.label, marginBottom: 4 }}>Chỉ định dùng thuốc:</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.cell}>Tên thuốc</Text>
                        <Text style={styles.cell}>Liều lượng</Text>
                        <Text style={styles.cell}>Tần suất uống</Text>
                    </View>
                    {record.prescriptionItems.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.cell}>{item.medicine?.name || 'Không rõ'}</Text>
                            <Text style={styles.cell}>{item.dosage || '-'}</Text>
                            <Text style={styles.cell}>{item.frequency || '-'}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Page>
    </Document>
);

export default ExaminationPDF;
