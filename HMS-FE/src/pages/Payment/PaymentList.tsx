import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Tag, Space, message, Typography, Tooltip, Popconfirm, Input, Select, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getPendingPayments, getInvoiceDetail, confirmPayment, updatePaymentStatus, getAllPayments } from '../../services/payment.service';
import UserListTitle from '../../components/ui/UserListTitle';
import { BanknoteArrowUp, Eye, ReceiptText, RefreshCcw, X, XCircle } from 'lucide-react';
import { useSocket } from '../../hooks/socket/useSocket';

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

  const [status, setStatus] = useState<string>('all');
  const [sort, setSort] = useState<string>('newest');
  const [searchName, setSearchName] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchData = async (page = 1, pageSize = 10, name = searchName, status = 'all', sort = 'newest') => {
    setLoading(true);
    try {
      const res = await getAllPayments({
        page,
        limit: pageSize,
        status: status === 'all' ? undefined : status,
        name: name || undefined,
        sort: sort === 'newest' ? 'desc' : 'asc',
      });
      console.log(res)
      setData(res.data.metadata.payments);
      setPagination({ current: res.data.metadata.currentPage, pageSize, total: res.data.metadata.totalCount });
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
      // console.log(res)
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

  // patient mở phòng payment, socket sẽ gửi event payment:statusChanged đến client
  // useSocket(
  //   `payment`,
  //   "payment:statusChanged",
  //   (data: any) => {
  //     fetchData();
  //   }
  // );

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
        // hour: '2-digit',
        // minute: '2-digit',
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
      width: 150,
      render: (status) =>
        status === 'paid' ? <Tag color="green">Đã thanh toán</Tag> : status === 'canceled' ? <Tag color="red">Đã hủy</Tag> : <Tag color="orange">Chưa thanh toán</Tag>,
    },
    {
      title: 'Hành động',
      width: 250,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem hóa đơn">
            <Button onClick={() => {
              handleViewInvoice(record)
            }}>
              <ReceiptText className="w-4 h-4" />
            </Button>
          </Tooltip>

          {record.status === 'pending' && (
            <>
              <Popconfirm
                placement="bottom"
                title="Xác nhận thanh toán?"
                onConfirm={() => handleUpdatePayment(record, 'paid')}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Tooltip title="Xác nhận thanh toán">
                  <Button type="primary">
                    <BanknoteArrowUp className="w-4 h-4" />
                    Xác nhận
                  </Button>
                </Tooltip>
              </Popconfirm>
              <Tooltip title="Hủy thanh toán">
                <Popconfirm
                  placement="bottom"
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

  const handleResetFilter = () => {
    setSearchName('');
    setStatus('all');
    setSort('newest');
    fetchData(1, 10, '', 'all', 'newest');
  }

  return (
    <>
      <UserListTitle title="hóa đơn" />

      <Space style={{ marginBottom: 16 }}>
      <Tooltip title="Hủy lọc">
            <Button onClick={() => handleResetFilter()}>
              <RefreshCcw size={17.5} />
            </Button>
          </Tooltip>
        <Input.Search
          placeholder="Tìm theo tên bệnh nhân"
          allowClear
          
          onSearch={(val) => {
            setSearchName(val);
            fetchData(1, 10, val);
          }}
        />

        <Select
          value={status}
          onChange={(val) => {
            setStatus(val);
            fetchData(1, 10, searchName, val);
          }}
          style={{ width: 160 }}
        >
          <Select.Option value="all">Tất cả trạng thái</Select.Option>
          <Select.Option value="pending">Chưa thanh toán</Select.Option>
          <Select.Option value="paid">Đã thanh toán</Select.Option>
          <Select.Option value="canceled">Đã hủy</Select.Option>
        </Select>
        <Select
          value={sort}
          onChange={(val) => {
            setSort(val);
            fetchData(1, 10, searchName, status, val);
          }}  
          style={{ width: 160 }}
        >
          <Select.Option value="newest">Mới nhất</Select.Option>
          <Select.Option value="oldest">Cũ nhất</Select.Option>
        </Select>

      </Space>


      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          onChange: (page, pageSize) => {
            fetchData(page, pageSize);
          }
        }}
      />


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
    </>
  );
};

export default PaymentList;
