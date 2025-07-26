import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Tooltip, Popconfirm, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getInvoiceDetail, updateInvoice, updatePaymentStatus, getAllPayments } from '../../services/payment.service';
import UserListTitle from '../../components/ui/UserListTitle';
import { BanknoteArrowUp, Edit, ReceiptText, RefreshCcw, StepForward, XCircle } from 'lucide-react';
import ModalViewPayment from './ModalViewPayment';
import ModalEditPayment from './ModalEditPayment';

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
  const [modalEditVisible, setModalEditVisible] = useState(false);
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
  const handleEditInvoice = async (record: InvoiceRecord) => {
    setSelectedInvoice(record);
    try {
      const res = await getInvoiceDetail(record.record_id);
      // console.log(res)
      setInvoiceItems(res.data.metadata);
      setModalEditVisible(true);
    } catch (err) {
      message.error('Không lấy được chi tiết hóa đơn');
    }
  };

  const handleUpdatePayment = async (record: InvoiceRecord, status: 'paid' | 'canceled' | 'pending') => {
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
          {record.status === 'canceled' && (
            <>
              <Tooltip title="Tiếp tục thanh toán">

                <Button type="default" onClick={() => {
                  handleUpdatePayment(record, 'pending');
                }}>
                  <StepForward className="w-4 h-4" />
                </Button>
              </Tooltip>
            </>
          )}
    
  

          {record.status === 'pending' && (
            <>
              <Tooltip title="Cập nhật hóa đơn">

                <Button type="default" onClick={() => {
                  handleEditInvoice(record);
                }}>
                  <Edit className="w-4 h-4" />
                </Button>
              </Tooltip>
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

  const handleSubmitInvoice = async (items: any[]) => {
    try {
      if (!selectedInvoice?.record_id) {
        message.error("Không tìm thấy hóa đơn");
        return;
      }
      await updateInvoice(selectedInvoice?.record_id, items);
      message.success("Tạo hóa đơn thành công!");
      fetchData(); // reload list
    } catch (err) {
      message.error("Tạo hóa đơn thất bại!");
    }
  };


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


      <ModalViewPayment
        selectedInvoice={selectedInvoice}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        invoiceItems={invoiceItems}
        loading={loading}
      />
      <ModalEditPayment
        modalVisible={modalEditVisible}
        setModalVisible={setModalEditVisible}
        invoiceItems={invoiceItems}
        loading={loading}
        onSubmit={handleSubmitInvoice}
      />



    </>
  );
};

export default PaymentList;
