import { Modal, Form, Input, Button, Checkbox, Flex, InputNumber, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import mainRequest from "../../../api/mainRequest";
import { CircleCheck, CircleX, Delete, Edit } from "lucide-react";
import { useMedicineList } from "../../../hooks/useMedicineList";
import type { IMedicine } from "../../../types/index.type";
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
    const [medicinesAdded, setMedicinesAdded] = useState<IMedicine[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<IMedicine | null>(null);
    const [quantity, setQuantity] = useState<number>(0);
    const [optionMedicines, setOptionMedicines] = useState<any[]>([]);
    const [isCreate, setIsCreate] = useState(true);
    const [medicineVisible, setMedicineVisible] = useState(false);
    const handleSetMedicineVisible = (value: boolean) => {
        setMedicineVisible(value);
        if (!value) {
            setMedicinesAdded([]);
        }
    };
    // useEffect(() => {
    //     if (open) {
    //         fetchMedicineList();
    //     }
    // }, [open]);

    const { medicines } = useMedicineList();
    console.log(medicines)
    useEffect(() => {
        if (medicines) {
            setOptionMedicines(medicines.map((item, index) => ({
                label: `${item.name} `,
                value: item.id,
            })));
        }
    }, [medicines]);
    // const fetchMedicineList = async () => {
    //     try {
    //         // const { medicines } = await getListMedicine({});
    //         const medicines: any[] = []
    //         const options = medicines.map((item) => ({
    //             label: `${item.name} - SL: ${item.quantity}`,
    //             value: item._id,
    //             ...item,
    //         }));
    //         setOptionMedicines(options);
    //     } catch (err) {
    //         console.error("Fetch medicine failed:", err);
    //     }
    // };

    const clearsMedicine = () => {
        setQuantity(0);
        setSelectedMedicine(null);
        setIsCreate(true);
    };

    const handleAddMedicine = () => {
        if (selectedMedicine) {
            const index = medicinesAdded.findIndex((item) => item.id === selectedMedicine.id);
            const newList = [...medicinesAdded];
            if (index !== -1) newList.splice(index, 1);
            newList.unshift({
                id: selectedMedicine.id,
                name: selectedMedicine.name,
                stock: selectedMedicine.stock,
                price: selectedMedicine.price,
            });
            setMedicinesAdded(newList);
            clearsMedicine();
        }
    };

    const handleEdit = (record: IMedicine) => {
        const selected = optionMedicines.find((opt) => opt.value === record.id);
        setSelectedMedicine(selected);
        setQuantity(record.stock);
        setIsCreate(false);
    };

    const handleRemoveMedicine = (record: any) => {
        const newList = medicinesAdded.filter((item) => item.id !== record.id);
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
    console.log(selectedMedicine)
    const handleSetMedicine = (option: any) => {
        console.log("option", option)
        const medicine = medicines.find((item) => item.id === option.value);
        if (medicine) {
            setSelectedMedicine(medicine);
            setQuantity(medicine.stock);
        }
    }
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

                <Space size={16}>
                    <Form.Item
                        layout="horizontal"
                        valuePropName="checked"
                        label="Thêm đơn thuốc"
                        tooltip="Nếu chọn, hồ sơ khám tổng quát có thêm đơn thuốc"
                    >
                        <Checkbox onChange={(e) => handleSetMedicineVisible(e.target.checked)}>
                        </Checkbox>
                    </Form.Item>
                </Space>

                {
                    medicineVisible && (
                        <>
                            <Form.Item label="Đơn thuốc">
                                <Flex justify="space-between" gap={8}>
                                    <Select
                                        showSearch
                                        style={{ flex: 1 }}
                                        placeholder="Chọn thuốc"
                                        options={optionMedicines}
                                        value={selectedMedicine?.id}
                                        onChange={(_, option: any) => {
                                            handleSetMedicine(option);
                                        }}
                                        disabled={!isCreate}
                                    />
                                    <InputNumber
                                        min={1}
                                        placeholder="Số lượng"
                                        value={quantity}
                                        max={selectedMedicine?.stock}
                                        onChange={(val) => {
                                            setQuantity(val || 0);
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        onClick={handleAddMedicine}
                                        disabled={!selectedMedicine || quantity <= 0}
                                    >
                                        {isCreate ? "Thêm" : "Cập nhật"}
                                    </Button>
                                </Flex>
                            </Form.Item>

                            <Table
                                rowKey="id"
                                columns={[
                                    {
                                        title: "Tên thuốc",
                                        dataIndex: "name",
                                    },
                                    {
                                        title: "SL",
                                        dataIndex: "stock",
                                        width: 100,
                                    },
                                    {
                                        title: "Thao tác",
                                        dataIndex: "actions",
                                        width: 150,
                                        render: (_, record) => (
                                            <Space>
                                                <Button
                                                    size="small"
                                                    icon={<Edit className="w-4 h-4" />}
                                                    onClick={() => handleEdit(record)}
                                                />
                                                <Popconfirm
                                                    title="Xóa thuốc này?"
                                                    onConfirm={() => handleRemoveMedicine(record)}
                                                >
                                                    <Button size="small" icon={<Delete className="w-4 h-4"  />} danger />
                                                </Popconfirm>
                                            </Space>
                                        ),
                                    },
                                ]}
                                dataSource={medicinesAdded}
                                pagination={false}
                            />

                        </>)}

            </Form>
        </Modal>
    );
};

export default DoctorExaminationRecordModal;
