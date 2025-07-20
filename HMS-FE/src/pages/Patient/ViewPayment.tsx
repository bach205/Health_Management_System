import { Modal, Table, Typography } from "antd";
import { useEffect } from "react";
import { useState } from "react";
import { getInvoiceDetailByAppointmentId } from "../../services/payment.service";

const ViewPayment = ({ record, modalVisible, setModalVisible }: any) => {
    const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            console.log(record)
            const res = await getInvoiceDetailByAppointmentId(record.id);
            console.log(res)
            setInvoiceItems(res.data.metadata.invoiceItems);
        }
        fetchInvoice();
    }, [record]);

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
                            Thanh toán qua mã QR dưới đây:
                        </Typography.Title>
                        <div className='flex flex-col justify-center mt-4 w-[300px] h-[300px] mx-auto'>
                            <img
                                src={`https://qr.sepay.vn/img?acc=VQRQADITO0867&bank=MBBank&amount=${totalAmount}&des=Thanh%20Toan%20${record?.patient?.user?.full_name}`} alt="" />

                        </div>
                    </>
                }
            </div>
        </Modal>
    );
}

export default ViewPayment;