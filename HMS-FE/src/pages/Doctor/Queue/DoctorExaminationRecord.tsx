import { Modal, Form, Input, Button, Checkbox, Flex, InputNumber, Popconfirm, Select, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import mainRequest from "../../../api/mainRequest";
import { CircleCheck, CircleX, Delete, Edit } from "lucide-react";
interface ExaminationRecordModalProps {
    open: boolean;
    onClose: () => void;
    patientId: number;
    doctorId?: number;
    onSuccess?: () => void;
}

const DoctorExaminationRecordModal = ({
    open,
    onClose,
    patientId,
    doctorId,
    onSuccess,
}: ExaminationRecordModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [medicinesAdded, setMedicinesAdded] = useState<any[]>([]);
    const [medicine, setMedicine] = useState<any>(null);
    const [quantity, setQuantity] = useState<number>(0);
    const [outOfPill, setOutOfPill] = useState<boolean>(false);
    const [optionMedicines, setOptionMedicines] = useState<any[]>([]);
    const [isCreate, setIsCreate] = useState(true);

    useEffect(() => {
        if (open) {
            fetchMedicineList();
        }
    }, [open]);

    const fetchMedicineList = async () => {
        try {
            // const { medicines } = await getListMedicine({});
            const medicines: any[] = []
            const options = medicines.map((item) => ({
                label: `${item.name} - SL: ${item.quantity}`,
                value: item._id,
                ...item,
            }));
            setOptionMedicines(options);
        } catch (err) {
            console.error("Fetch medicine failed:", err);
        }
    };

    const clearsMedicine = () => {
        setQuantity(0);
        setOutOfPill(false);
        setMedicine(null);
        setIsCreate(true);
    };

    const handleAddMedicine = () => {
        if (medicine) {
            const index = medicinesAdded.findIndex((item) => item._id === medicine._id);
            const newList = [...medicinesAdded];
            if (index !== -1) newList.splice(index, 1);
            newList.unshift({
                _id: medicine._id,
                name: medicine.name,
                quantity,
                usage: medicine.usage,
                outOfPill,
            });
            setMedicinesAdded(newList);
            clearsMedicine();
        }
    };

    const handleEdit = (record: any) => {
        const selected = optionMedicines.find((opt) => opt._id === record._id);
        setMedicine(selected);
        setQuantity(record.quantity);
        setOutOfPill(record.outOfPill);
        setIsCreate(false);
    };

    const handleRemoveMedicine = (record: any) => {
        const newList = medicinesAdded.filter((item) => item._id !== record._id);
        setMedicinesAdded(newList);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await mainRequest.post("/api/v1/examination-record", {
                ...values,
                patient_id: patientId,
                primary_doctor_id: doctorId,
            });
            toast.success("Tạo hồ sơ khám tổng quát thành công!");
            form.resetFields();
            onClose();
            onSuccess?.();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo hồ sơ khám tổng quát"
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            okText="Lưu hồ sơ"
            cancelText="Hủy"
            centered
            width={750}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="pt-2"
            >
                <Form.Item
                    label="Triệu chứng"
                    name="symptoms"
                    rules={[{ required: true, message: "Vui lòng nhập triệu chứng" }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập triệu chứng..." />
                </Form.Item>

                <Form.Item
                    label="Chẩn đoán cuối cùng"
                    name="final_diagnosis"
                    rules={[{ required: true, message: "Vui lòng nhập chẩn đoán cuối cùng" }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập chẩn đoán cuối cùng..." />
                </Form.Item>
                <Form.Item label="Đơn thuốc">
                    <Flex justify="space-between" gap={8}>
                        <Select
                            showSearch
                            style={{ flex: 1 }}
                            placeholder="Chọn thuốc"
                            options={optionMedicines}
                            value={medicine?._id}
                            onChange={(_, option: any) => {
                                setMedicine(option);
                            }}
                            disabled={!isCreate}
                        />
                        <InputNumber
                            min={1}
                            placeholder="Số lượng"
                            value={quantity}
                            onChange={(val) => {
                                setQuantity(val  || 0);
                                setOutOfPill(val  > +medicine?.quantity);
                            }}
                        />
                        <Space>
                            <Checkbox
                            checked={outOfPill}
                            onChange={(e) => setOutOfPill(e.target.checked)}
                            
                        >
                            Hết thuốc
                        </Checkbox>
                        </Space>
                        <Button
                            type="primary"
                            onClick={handleAddMedicine}
                            disabled={!medicine || quantity <= 0}
                        >
                            {isCreate ? "Thêm" : "Cập nhật"}
                        </Button>
                    </Flex>
                </Form.Item>

                <Table
                    rowKey="_id"
                    columns={[
                        {
                            title: "Tên thuốc",
                            dataIndex: "name",
                        },
                        {
                            title: "SL",
                            dataIndex: "quantity",
                            width: 60,
                        },
                        {
                            title: "Hết thuốc",
                            dataIndex: "outOfPill",
                            width: 80,
                            render: (val) => (
                                <Tag color={val ? "red" : "blue"}>
                                    {val ? <CircleX /> : <CircleCheck />}
                                </Tag>
                            ),
                        },
                        {
                            title: "Thao tác",
                            dataIndex: "actions",
                            width: 100,
                            render: (_, record) => (
                                <Space>
                                    <Button
                                        size="small"
                                        icon={<Edit />}
                                        onClick={() => handleEdit(record)}
                                    />
                                    <Popconfirm
                                        title="Xóa thuốc này?"
                                        onConfirm={() => handleRemoveMedicine(record)}
                                    >
                                        <Button size="small" icon={<Delete/>} danger />
                                    </Popconfirm>
                                </Space>
                            ),
                        },
                    ]}
                    dataSource={medicinesAdded}
                    pagination={false}
                />

            </Form>
        </Modal>
    );
};

export default DoctorExaminationRecordModal;
