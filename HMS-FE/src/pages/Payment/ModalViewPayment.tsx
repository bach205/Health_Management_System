import { Modal, Table, Checkbox, Input, Button, Typography } from "antd";
import { Download, FileText } from "lucide-react";
import InvoicePDF from "./InvoicePDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
const ModalViewPayment = ({ selectedInvoice, modalVisible, setModalVisible, invoiceItems, loading }: { selectedInvoice: any, modalVisible: boolean, setModalVisible: (visible: boolean) => void, invoiceItems: any[], loading: boolean }) => {
    return (
        <Modal
            title={`Chi tiết hóa đơn - ${selectedInvoice?.patient_name}`}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            centered
            footer={null}
        >
            <Table
                dataSource={invoiceItems}
                rowKey="id"
                pagination={false}
                loading={loading}
                columns={[
                    { title: 'Dịch vụ', dataIndex: 'description' },
                    {
                        title: 'Thành tiền',
                        dataIndex: 'amount',
                        render: (val) => `${val.toLocaleString()}đ`,
                    },
                ]}
            />
            <div style={{ marginTop: 16 }}>
                <p className='text-end'>
                    <strong>Tổng tiền:</strong> {selectedInvoice?.total_amount.toLocaleString()}đ
                </p>


                <br />

                {
                    selectedInvoice?.total_amount && selectedInvoice?.total_amount > 0 &&
                    selectedInvoice?.status === 'paid' &&
                    <div className='flex justify-end'>
                        <PDFDownloadLink
                            document={
                                <InvoicePDF invoice={selectedInvoice} invoiceItems={invoiceItems} />
                            }
                            fileName={`ket-qua-kham-${selectedInvoice?.id}.pdf`}
                        >
                            {({ loading }) => (
                                <Button type="primary" loading={loading}>
                                    <FileText className='w-4 h-4' />
                                    Xuất hóa đơn
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                }
                {
                    selectedInvoice?.total_amount && selectedInvoice?.total_amount > 0 &&
                    selectedInvoice?.status === 'pending' &&
                    <>
                        <Typography.Title level={5} className='mt-2 text-center'>
                            Thanh toán qua mã QR dưới đây:
                        </Typography.Title>
                        <div className='flex flex-col justify-center mt-4 w-[300px] h-[300px] mx-auto'>
                            <img
                                src={`https://qr.sepay.vn/img?acc=VQRQADITO0867&bank=MBBank&amount=${selectedInvoice?.total_amount}&des=Thanh%20Toan%20${selectedInvoice?.patient_name}`} alt="" />

                        </div>
                    </>
                }
            </div>
        </Modal>
    );
}

export default ModalViewPayment;