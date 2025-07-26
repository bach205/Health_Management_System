// components/PDF/InvoicePDF.tsx
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
import dayjs from 'dayjs';

import RobotoVietnam from '../../fonts/Roboto-Regular.ttf';
import RobotoVietnamBold from '../../fonts/Roboto-Bold.ttf';

Font.register({ family: 'RobotoVietnam', src: RobotoVietnam });
Font.register({ family: 'RobotoVietnamBold', src: RobotoVietnamBold });

const HEADER_IMAGE = '/src/assets/prjLogo.png'

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: 'RobotoVietnam' },
    section: { marginBottom: 10 },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        gap: 12
    },
    infoSectionItemLeft: {
        flex: 1,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row'
    },
    infoSectionItemRight: {
        flex: 1,
        textAlign: 'right',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    title: { fontSize: 16, fontFamily: 'RobotoVietnamBold', textAlign: 'center', marginBottom: 10 },
    label: { fontFamily: 'RobotoVietnamBold' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    tableHeader: { flexDirection: 'row', borderBottom: 1, marginBottom: 4 },
    tableRow: { flexDirection: 'row', borderBottom: 0.5 },
    cell: { flex: 1, padding: 2 },
    total: { textAlign: 'left', marginTop: 10, fontSize: 13, fontFamily: 'RobotoVietnam' },
    totalBold: { fontFamily: 'RobotoVietnamBold', fontSize: 13 }
});

const InvoicePDF = ({ invoice, invoiceItems }: { invoice: any; invoiceItems: any[]; }) => {
    // BHYT Thanh toán
    const discount = invoiceItems.find((item: any) => item.description === 'Giảm giá BHYT');
    // Bệnh nhân phải đóng
    const total = invoiceItems.reduce((acc: number, item: any) => acc + item.amount, 0);


    // Giá trị hóa đơn
    const filteredInvoiceItems = invoiceItems.filter((item: any) => item.description !== 'Giảm giá BHYT');
    const filteredTotal = filteredInvoiceItems.reduce((acc: number, item: any) => acc + item.amount, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Image
                    src={HEADER_IMAGE}
                    style={{ width: 150, height: 50, marginBottom: 10 }}
                />
                <Text style={styles.title}>HÓA ĐƠN THANH TOÁN</Text>

                <View style={styles.infoSection}>
                    <View style={styles.infoSectionItemLeft}>
                        <Text>
                            <Text style={styles.label}>Họ tên bệnh nhân: </Text>
                            {invoice?.patient_name || 'Không rõ'}
                        </Text>
                    </View>

                    <View style={styles.infoSectionItemRight}>
                        <Text>
                            <Text style={styles.label}>Ngày tạo: </Text>
                            {dayjs(invoice?.created_at).format('DD/MM/YYYY')}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoSectionItemLeft}>
                        <Text>
                            <Text style={styles.label}>Trạng thái: </Text>
                            {invoice?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Text>
                    </View>

                </View>


                <View style={{ ...styles.section, marginTop: 10 }}>
                    <Text style={{ ...styles.label, marginBottom: 4 }}>Chi tiết dịch vụ:</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.cell}>Dịch vụ</Text>
                        <Text style={styles.cell}>Thành tiền</Text>
                    </View>
                    {filteredInvoiceItems?.map((item: any, idx: number) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.cell}>{item.description}</Text>
                            <Text style={styles.cell}>{item.amount?.toLocaleString()}đ</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.total}><Text style={styles.totalBold}>Giá trị hóa đơn:</Text> {filteredTotal.toLocaleString()}đ</Text>
                    {discount && (
                        <Text style={styles.total}><Text style={styles.totalBold}>BHYT thanh toán:</Text> {Math.abs(discount.amount).toLocaleString()}đ</Text>
                    )}
                    <Text style={styles.total}><Text style={styles.totalBold}>Bệnh nhân phải đóng:</Text> {total.toLocaleString()}đ</Text>
                </View>
            </Page>
        </Document>
    )
};

export default InvoicePDF;
