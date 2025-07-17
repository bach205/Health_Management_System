import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, Descriptions, Modal, Spin, Space } from 'antd';
import { useAuthStore } from '../../store/authStore';
import { getPatientExaminationHistory } from '../../services/examinationRecord.service';
import dayjs from 'dayjs';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ExaminationHistory: React.FC = () => {
    const { user } = useAuthStore();
    const [examinationHistory, setExaminationHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        const fetchExaminationHistory = async () => {
            if (user?.id) {
                try {
                    const res = await getPatientExaminationHistory(Number(user.id));
                    setExaminationHistory(res.data.metadata || []);
                } catch (error: any) {
                    console.error('Error fetching examination history:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchExaminationHistory();
    }, [user]);

    const columns = [
        {
            title: 'Ngày khám',
            dataIndex: 'examined_at',
            key: 'examined_at',
            width: 120,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Giờ khám',
            dataIndex: 'examined_at',
            key: 'examined_at_time',
            width: 80,
            render: (date: string) => dayjs(date).format('HH:mm'),
        },
        {
            title: 'Bác sĩ',
            dataIndex: ['doctor', 'user', 'full_name'],
            key: 'doctor',
            width: 150,
        },
        {
            title: 'Phòng khám',
            dataIndex: ['clinic', 'name'],
            key: 'clinic',
            width: 150,
        },
        {
            title: 'Kết quả',
            dataIndex: 'result',
            key: 'result',
            ellipsis: true,
            render: (result: string) => (
                <Text ellipsis={{ tooltip: result }}>
                    {result || 'Chưa có kết quả'}
                </Text>
            ),
        },
        {
            title: 'Đơn thuốc',
            dataIndex: 'prescriptionItems',
            key: 'prescription',
            width: 100,
            render: (prescriptionItems: any[]) => (
                <Tag color={prescriptionItems?.length > 0 ? 'green' : 'default'}>
                    {prescriptionItems?.length || 0} loại
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedRecord(record);
                            setDetailModalVisible(true);
                        }}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <Card>
                <Title level={3} style={{ marginBottom: 24 }}>
                    Lịch sử khám bệnh
                </Title>

                {examinationHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Text type="secondary">Bạn chưa có lịch sử khám bệnh</Text>
                    </div>
                ) : (
                    <Table
                        dataSource={examinationHistory}
                        columns={columns}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
                        }}
                        rowKey="id"
                        size="middle"
                    />
                )}
            </Card>

            {/* Modal chi tiết kết quả khám */}
            <Modal
                title="Chi tiết kết quả khám"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={800}
            >
                {selectedRecord && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Ngày khám">
                            {dayjs(selectedRecord.examined_at).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bác sĩ">
                            {selectedRecord.doctor?.user?.full_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng khám">
                            {selectedRecord.clinic?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kết quả khám">
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {selectedRecord.result || 'Chưa có kết quả'}
                            </div>
                        </Descriptions.Item>
                        {selectedRecord.note && (
                            <Descriptions.Item label="Ghi chú">
                                <div style={{ whiteSpace: 'pre-line' }}>
                                    {selectedRecord.note}
                                </div>
                            </Descriptions.Item>
                        )}
                        {selectedRecord.prescriptionItems?.length > 0 && (
                            <Descriptions.Item label="Đơn thuốc">
                                <Table
                                    dataSource={selectedRecord.prescriptionItems}
                                    columns={[
                                        { title: 'Tên thuốc', dataIndex: ['medicine', 'name'], key: 'medicine' },
                                        { title: 'Liều lượng', dataIndex: 'dosage', key: 'dosage' },
                                        { title: 'Tần suất', dataIndex: 'frequency', key: 'frequency' },
                                        { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
                                    ]}
                                    pagination={false}
                                    size="small"
                                />
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default ExaminationHistory; 