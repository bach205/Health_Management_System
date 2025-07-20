import React, { useState, useMemo, useEffect } from "react";
import { Input, Button, Card, Descriptions, Table, Typography, message, Space, Select, DatePicker, Modal } from "antd";
import { getUserDataByIdentity } from "../api/salemedicine";
import type { Patient, User, Record } from '../types/patient.type';
import dayjs from "dayjs";
import { EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getPaymentByRecordId, updatePaymentMedicineStatus, updatePaymentStatus } from '../services/payment.service';
const { Title } = Typography;
const { Option } = Select;

type PatientRecord = {
  id: number;
  identity_number: string;
  created_at: string;
  updated_at: string;
  user: User;
  records: Record[];
} 

const SaleMedicinePage: React.FC = () => {
  const [identityNumber, setIdentityNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [doctorFilter, setDoctorFilter] = useState<string | undefined>(undefined);
  const [clinicFilter, setClinicFilter] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [searchSubmittedText, setSearchSubmittedText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedPrescriptionRecord, setSelectedPrescriptionRecord] = useState<Record | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);


  useEffect(() => {
    const fetch = async () => {
      if(selectedPrescriptionRecord) {
        const data = await getPaymentByRecordId(selectedPrescriptionRecord.id);
        if(data.data.metadata.status === 'paid') setPaymentSuccess(true)
        else setPaymentSuccess(false);
      }
    }
    fetch();
  },[selectedPrescriptionRecord])

  const handleSearch = async () => {
    if (!identityNumber) {
      message.warning("Vui lòng nhập số CCCD/CMND");
      return;
    }
    setLoading(true);
    try {
      const res = await getUserDataByIdentity(identityNumber);
      console.log(res.data.metadata.patient)
      setPatient(res.data.metadata.patient);  
      setPage(1);
      setDoctorFilter(undefined);
      setClinicFilter(undefined);
      setDateFilter(null);
      setSearchText(""); // Clear search text on new search
      setSearchSubmittedText(""); // Clear submitted search on new search
    } catch (err: any) {
      message.error("Không tìm thấy bệnh nhân hoặc lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };
  const gender = (gen : string) => {
    if(gen == 'male') return 'Nam';
    else return 'Nữ';
  }

  // Lấy danh sách unique bác sĩ và phòng khám cho filter
  const doctorOptions = useMemo(() => {
    if (!patient) return [];
    const doctors = patient.records.map(r => r.doctor?.user?.full_name).filter(Boolean);
    return Array.from(new Set(doctors));
  }, [patient]);
  const clinicOptions = useMemo(() => {
    if (!patient) return [];
    const clinics = patient.records.map(r => r.clinic?.name).filter(Boolean);
    return Array.from(new Set(clinics));
  }, [patient]);

  // Lọc dữ liệu
  const filteredRecords = useMemo(() => {
    if (!patient) return [];
    return patient.records.filter(r => {
      let ok = true;
      if (doctorFilter) ok = ok && r.doctor?.user?.full_name === doctorFilter;
      if (clinicFilter) ok = ok && r.clinic?.name === clinicFilter;
      if (dateFilter) ok = ok && dayjs(r.examined_at).isSame(dateFilter, 'day');
      if (searchSubmittedText) {
        const keyword = searchSubmittedText.toLowerCase();
        const doctorName = r.doctor?.user?.full_name?.toLowerCase() || "";
        const clinicName = r.clinic?.name?.toLowerCase() || "";
        const result = r.result?.toLowerCase() || "";
        const note = r.note?.toLowerCase() || "";
        ok = ok && (
          doctorName.includes(keyword) ||
          clinicName.includes(keyword) ||
          result.includes(keyword) ||
          note.includes(keyword)
        );
      }
      return ok;
    });
  }, [patient, doctorFilter, clinicFilter, dateFilter, searchSubmittedText]);

  // Pagination
  const pagedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const columns = [
    {
      title: "ID Record",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Phòng khám",
      dataIndex: ["clinic", "name"],
      key: "clinic_name",
    },
    {
      title: "Bác sĩ",
      dataIndex: ["doctor", "user", "full_name"],
      key: "doctor_name",
    },
    {
      title: "Kết quả khám",
      dataIndex: "result",
      key: "result",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Ngày khám",
      dataIndex: "examined_at",
      key: "examined_at",
      render: (text: string) => text ? new Date(text).toLocaleString() : "",
    },
    {
      title: "Xem thuốc",
      key: "view_prescription",
      render: (_: any, record: any) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => setSelectedPrescriptionRecord(record)}
          disabled={!record.prescriptionItems || record.prescriptionItems.length === 0}
        >
          Xem thuốc
        </Button>
      ),
    },
  ];

  const prescriptionColumns = [
    {
      title: "Tên thuốc",
      dataIndex: ["medicine", "name"],
      key: "medicine_name",
      render: (_: any, record: any) => record.medicine?.name || "",
    },
    {
      title: "Liều dùng",
      dataIndex: "dosage",
      key: "dosage",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: any) => quantity || 1,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Giá",
      dataIndex: ["medicine", "price"],
      key: "medicine_price",
      render: (_: any, record: any) => record.medicine?.price || "",
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <Title level={2}>Bán thuốc theo đơn</Title>
      <Space style={{ marginBottom: 24 }}>
        <Input
          placeholder="Nhập số CCCD/CMND bệnh nhân"
          value={identityNumber}
          onChange={e => setIdentityNumber(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" loading={loading} onClick={handleSearch}>
          Tìm kiếm
        </Button>
        
      </Space>
      {patient && (
        <Card title={`Thông tin bệnh nhân: ${patient.user?.full_name || ""}`} style={{ marginTop: 16, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="ID bệnh nhân">{patient.id}</Descriptions.Item>
            <Descriptions.Item label="Số CCCD/CMND">{patient.identity_number}</Descriptions.Item>
            <Descriptions.Item label="Họ tên">{patient.user?.full_name}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{patient.user?.phone}</Descriptions.Item>
            <Descriptions.Item label="Email">{patient.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{patient.user?.address}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{gender(patient.user?.gender)}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{patient.user?.date_of_birth ? new Date(patient.user.date_of_birth).toLocaleDateString() : ""}</Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 24 }}>
            <Space wrap style={{ marginBottom: 16, width: '100%' }}>
              <Input
                allowClear
                placeholder="Tìm kiếm từ khóa (bác sĩ, phòng khám, kết quả, ghi chú)"
                style={{ width: 250 }}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onPressEnter={() => setSearchSubmittedText(searchText)}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={() => setSearchSubmittedText(searchText)} />

              <Button icon={<ReloadOutlined />} onClick={() => {
                setDoctorFilter(undefined);
                setClinicFilter(undefined);
                setDateFilter(null);
                setSearchText("");
                setSearchSubmittedText("");
                setPage(1);
              }} />

              <Select
                allowClear
                placeholder="Lọc theo bác sĩ"
                style={{ width: 180 }}
                value={doctorFilter}
                onChange={setDoctorFilter}
              >
                {doctorOptions.map(name => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
              <Select
                allowClear
                placeholder="Lọc theo phòng khám"
                style={{ width: 180 }}
                value={clinicFilter}
                onChange={setClinicFilter}
              >
                {clinicOptions.map(name => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
              <DatePicker
                allowClear
                placeholder="Lọc theo ngày khám"
                value={dateFilter}
                onChange={setDateFilter}
                format="DD/MM/YYYY"
              />
            </Space>
            <Table
              columns={columns}
              dataSource={pagedRecords}
              rowKey="id"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: filteredRecords.length,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
                showSizeChanger: true,
                pageSizeOptions: [1, 3, 5, 7, 9],
              }}
            />
            <Modal
              open={!!selectedPrescriptionRecord}
              title={selectedPrescriptionRecord ? `Thuốc đã kê cho record #${selectedPrescriptionRecord.id}` : ''}
              onCancel={() => {
                setSelectedPrescriptionRecord(null);
                setPaymentSuccess(false);
              }}
              footer={null}
              width={700}
            >
              {selectedPrescriptionRecord && (
                <>
                  <Table
                    columns={prescriptionColumns}
                    dataSource={selectedPrescriptionRecord.prescriptionItems}
                    rowKey="id"
                    size="small"
                    pagination={false}
                  />
                  {(() => {
                    const totalAmount = (selectedPrescriptionRecord.prescriptionItems || []).reduce((sum, item) => sum + ((typeof item.medicine?.price === 'number' ? item.medicine.price : Number(item.medicine?.price) || 0) * (item.quantity || 1)), 0);
                    const qrUrl = `https://qr.sepay.vn/img?acc=VQRQADITO0867&bank=MBBank&amount=${totalAmount}&des=thanh toán thuốc`;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>Quét mã QR để thanh toán</div>
                        <img
                          src={qrUrl}
                          alt="QR thanh toán"
                          style={{ width: 200, height: 200, objectFit: 'contain', border: '1px solid #eee', borderRadius: 8 }}
                        />
                        <div style={{ marginTop: 8, color: '#888' }}>Tổng tiền: {totalAmount.toLocaleString()} VND</div>
                       {!paymentSuccess ? (
                         <Button
                           type="primary"
                           style={{ marginTop: 16 }}
                           onClick={async () => {
                             if (selectedPrescriptionRecord) {
                               try {
                                 await updatePaymentMedicineStatus(selectedPrescriptionRecord.id, 'paid');                        
                                 setPaymentSuccess(true);
                                 message.success("Xác nhận thanh toán thành công!");
                               } catch (err) {
                                 message.error("Lỗi khi cập nhật trạng thái thanh toán!");
                               }
                             }
                           }}
                           block
                         >
                           Xác nhận thanh toán
                         </Button>
                       ) : (
                         <div style={{ color: 'green', marginTop: 16, fontWeight: 500 }}>
                           Đã thanh toán thành công!
                         </div>
                       )}
                      </div>
                    );
                  })()}
                </>
              )}
            </Modal>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SaleMedicinePage;