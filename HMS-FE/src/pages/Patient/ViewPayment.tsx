import { Button, message, Modal, Table, Typography } from "antd";
import { useEffect } from "react";
import { useState } from "react";
import { getInvoiceDetailByAppointmentId, cancelPayment, updatePaymentStatus } from "../../services/payment.service";
import { X } from "lucide-react";

const ViewPayment = ({ record, modalVisible, setModalVisible, setReload, reload }: any) => {
    const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    console.log(record)

    useEffect(() => {
        const fetchInvoice = async () => {
            console.log(record)
            if (record) {
                const res = await getInvoiceDetailByAppointmentId(record.id);
                console.log(res)
                setInvoiceItems(res.data.metadata.invoiceItems);
            }
        }
        fetchInvoice();
    }, [record]);

    const handleCancelPayment = async () => {
        try {
            const res = await cancelPayment(record.examination_id, 'canceled');
            console.log(res)
            setModalVisible(false);
            message.success("Hủy hóa đơn thành công") 
            setReload(!reload)
        } catch (error) {
            console.log(error)
            message.error("Lỗi khi hủy hóa đơn")
        }
    }
    // const handleUpdatePayment = async (record: InvoiceRecord, status: 'paid' | 'canceled') => {
    //     try {
    //       await updatePaymentStatus(record.id, status);
    //       message.success('Cập nhật trạng thái thanh toán thành công');
    //       fetchData();
    //     } catch (err) {
    //       message.error('Không thể cập nhật trạng thái thanh toán');
    //     }
    //   };

    const totalAmount = invoiceItems.reduce((acc, item) => acc + Number(item.amount), 0);
    return (
        <Modal
            title={`Chi tiết hóa đơn`}
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
                    { title: 'Mô tả', dataIndex: 'description' },
                    {
                        title: 'Số tiền',
                        dataIndex: 'amount',
                        render: (val) => `${val.toLocaleString()}đ`,
                    },
                ]}
            />
            <div style={{ marginTop: 16 }}>
                <p >
                    <strong>Tổng tiền:</strong> {totalAmount.toLocaleString()}đ

                </p>
                <br />
                {
                    totalAmount > 0 &&
                    <>
                        <Typography.Title level={5} className='mt-2 text-center'>
                            Nếu chuyển khoản qua ngân hàng, vui lòng thanh toán qua mã QR dưới đây:
                        </Typography.Title>
                        <div className='flex flex-col justify-center mt-4 w-[300px] h-[300px] mx-auto'>
                            <img
                                src={`https://qr.sepay.vn/img?acc=VQRQADITO0867&bank=MBBank&amount=${totalAmount}&des=Thanh%20Toan%20${record?.patient?.user?.full_name}`} alt="" />

                        </div>
                    </>
                }
                <div className="flex justify-end mt-4">
                    <Button type="primary" danger onClick={() => handleCancelPayment()}>
                        <X className="w-4 h-4" />Hủy hóa đơn
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ViewPayment;