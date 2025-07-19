import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tag, Space, message, Typography, Tooltip, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getPendingPayments, getInvoiceDetail, confirmPayment, updatePaymentStatus } from '../../services/payment.service';
import UserListTitle from '../../components/ui/UserListTitle';
import { X, XCircle } from 'lucide-react';

interface InvoiceItem {
  id: number;
  description: string;
  amount: number;
}

interface InvoiceRecord {
  id: number;
  record_id: number;
  patient_name: string;
  examined_at: string;
  service_count: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'canceled';
}

const PaymentList: React.FC = () => {
  const [data, setData] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'canceled'>('all');
  const filteredData = data.filter((item) =>
    filterStatus === 'all' ? true : item.status === filterStatus
  );

  console.log(data)

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPendingPayments();
      console.log(res)
      const payments = res.data?.metadata ?? [];
      setData(payments);
    } catch (err) {
      message.error('Lỗi khi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (record: InvoiceRecord) => {
    setSelectedInvoice(record);
    try {
      const res = await getInvoiceDetail(record.record_id);
      setInvoiceItems(res.data.metadata);
      setModalVisible(true);
    } catch (err) {
      message.error('Không lấy được chi tiết hóa đơn');
    }
  };

  const handleUpdatePayment = async (record: InvoiceRecord, status: 'paid' | 'canceled') => {
    try {
      await updatePaymentStatus(record.id, status);
      message.success('Cập nhật trạng thái thanh toán thành công');
      fetchData();
    } catch (err) {
      message.error('Không thể cập nhật trạng thái thanh toán');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<InvoiceRecord> = [
    {
      title: 'Bệnh nhân',
      dataIndex: 'patient_name',
    },
    {
      title: 'Ngày khám',
      dataIndex: 'examined_at',
      render: (val) => new Date(val).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      title: 'Số dịch vụ',
      dataIndex: 'service_count',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      render: (val) => `${val.toLocaleString()}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) =>
        status === 'paid' ? <Tag color="green">Đã thanh toán</Tag> : status === 'canceled' ? <Tag color="red">Đã hủy</Tag> : <Tag color="orange">Chưa thanh toán</Tag>,
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleViewInvoice(record)}>Xem hóa đơn</Button>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Xác nhận thanh toán?"
                onConfirm={() => handleUpdatePayment(record, 'paid')}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button type="primary">
                  Xác nhận thanh toán
                </Button>
              </Popconfirm>
              <Tooltip title="Hủy thanh toán">
                <Popconfirm
                  title="Xác nhận hủy thanh toán?"
                  onConfirm={() => handleUpdatePayment(record, 'canceled')}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <Button type="primary" danger>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            </>

          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <UserListTitle title="hóa đơn" />

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={`Chi tiết hóa đơn - ${selectedInvoice?.patient_name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Table
          dataSource={invoiceItems}
          rowKey="id"
          pagination={false}
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
            <strong>Tổng tiền:</strong> {selectedInvoice?.total_amount.toLocaleString()}đ

          </p>
          <br />
          {
            selectedInvoice?.total_amount && selectedInvoice?.total_amount > 0 &&
            <>
              <Typography.Title level={5} className='mt-2 text-center'>
                Thanh toán qua mã QR dưới đây:
              </Typography.Title>
              <div className='flex justify-center mt-4'>
                <img src={`https://qr.sepay.vn/img?acc=VQRQADITO0867&bank=MBBank&amount=${selectedInvoice?.total_amount}&des=Thanh%20Toan%20${selectedInvoice?.patient_name}`} alt="" />

              </div>
            </>
          }
        </div>
      </Modal>
    </>
  );
};

export default PaymentList;
