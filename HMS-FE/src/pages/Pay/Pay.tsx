import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tag, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getInvoiceList, getInvoiceDetail, confirmPayment } from '../../services/payment.service';

interface InvoiceItem {
  id: number;
  description: string;
  amount: number;
}

interface InvoiceRecord {
  record_id: number;
  patient_name: string;
  examined_at: string;
  service_count: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'canceled';
}

const InvoiceListPage: React.FC = () => {
  const [data, setData] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getInvoiceList();
      setData(res.data.metadata);
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
      setInvoiceItems(res.data.metadata.items);
      setModalVisible(true);
    } catch (err) {
      message.error('Không lấy được chi tiết hóa đơn');
    }
  };

  const handleConfirmPayment = async (record: InvoiceRecord) => {
    try {
      await confirmPayment(record.record_id);
      message.success('Xác nhận thanh toán thành công');
      fetchData();
    } catch (err) {
      message.error('Không thể xác nhận thanh toán');
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
            <Button type="primary" onClick={() => handleConfirmPayment(record)}>
              Xác nhận thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="record_id"
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
      </Modal>
    </>
  );
};

export default InvoiceListPage;
