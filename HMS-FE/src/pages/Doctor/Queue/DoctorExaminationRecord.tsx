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
    patient_id: number;
    clinic_id: number;
    doctor_id?: number;
    onSuccess?: () => void;
}

const DoctorExaminationRecordModal = ({
    open,
    onClose,
    patient_id,
    clinic_id,
    doctor_id,
    onSuccess,
}: ExaminationRecordModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [medicinesAdded, setMedicinesAdded] = useState<IMedicine[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<IMedicine | null>(null);
    const [optionMedicines, setOptionMedicines] = useState<any[]>([]);
    const [isCreate, setIsCreate] = useState(true);
    const [medicineVisible, setMedicineVisible] = useState(false);
    const handleSetMedicineVisible = (value: boolean) => {
        setMedicineVisible(value);
        if (!value) {
            setMedicinesAdded([]);
        }
    };

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

    const clearsMedicine = () => {
        setSelectedMedicine(null);
        setIsCreate(true);
    };

    const handleAddMedicine = () => {
        if (selectedMedicine) {
            const index = medicinesAdded.findIndex((item) => item.id === selectedMedicine.id);
            const newList = [...medicinesAdded];

            if (index !== -1) newList.splice(index, 1); // Xóa nếu đã có để cập nhật lại

            newList.unshift({
                id: selectedMedicine.id,
                name: selectedMedicine.name,
                note: selectedMedicine.note, // thêm ghi chú
            });

            setMedicinesAdded(newList);
            clearsMedicine();
        }
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
                patient_id: patient_id,
                doctor_id: doctor_id,
                clinic_id: clinic_id,
                prescription_items: medicinesAdded.map((med) => ({
                    medicine_id: med.id,
                    note: med.note ?? null,
                })),
            });
            toast.success("Tạo hồ sơ khám thành công!");
            form.resetFields();
            setMedicinesAdded([]);
            onClose();
            onSuccess?.();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    // console.log(selectedMedicine)
    const handleSetMedicine = (option: any) => {
        console.log("option", option)
        const medicine = medicines.find((item) => item.id === option.value);
        if (medicine) {
            setSelectedMedicine(medicine);
        }
    }
    const handleCloseModal = () => {
        form.resetFields();
        handleSetMedicineVisible(false)
        setMedicinesAdded([]);
        clearsMedicine();
        onClose();
    }

    return (
        <Modal
            title="Tạo hồ sơ khám"
            open={open}
            onCancel={handleCloseModal}
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
                    label="Kết quả khám chuyên khoa"
                    name="result"
                    rules={[{ required: true, message: "Vui lòng nhập kết quả khám" }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập kết quả khám..." />
                </Form.Item>

                {/* note */}
                <Form.Item
                    label="Ghi chú"
                    name="note"
                    rules={[{ message: "Ghi chú" }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập ghi chú..." />
                </Form.Item>

                <Space size={16}>
                    <Form.Item
                        layout="horizontal"
                        label="Thêm đơn thuốc"
                        tooltip="Nếu chọn, hồ sơ khám tổng quát có thêm đơn thuốc"
                        initialValue={medicineVisible}
                    >
                        <Checkbox checked={medicineVisible} onChange={(e) => handleSetMedicineVisible(e.target.checked)} />
                    </Form.Item>
                </Space>

                {
                    medicineVisible && (
                        <>
                            <Form.Item label="Đơn thuốc">
                                <Flex justify="space-between" gap={8}>
                                    <Select showSearch

                                        style={{ minWidth: 200 }}
                                        placeholder="Chọn thuốc"
                                        options={optionMedicines}
                                        value={selectedMedicine?.id}
                                        onChange={(_, option: any) => {
                                            handleSetMedicine(option);
                                        }}
                                        disabled={!isCreate}
                                    />
                                    <Input
                                        placeholder="Ghi chú thuốc"

                                        value={selectedMedicine?.note}
                                        onChange={(e) => {
                                            if (selectedMedicine) {
                                                setSelectedMedicine({
                                                    ...selectedMedicine,
                                                    note: e.target.value,
                                                });
                                            }
                                        }}
                                        disabled={!isCreate}
                                    />

                                    <Button
                                        type="primary"
                                        onClick={handleAddMedicine}
                                        disabled={!selectedMedicine}
                                    >
                                        {isCreate ? "Thêm" : "Cập nhật"}
                                    </Button>
                                </Flex>
                            </Form.Item>

                            <Table rowKey="id"
                                columns={[
                                    {
                                        title: "Tên thuốc",
                                        dataIndex: "name",
                                    },
                                    {
                                        title: "Ghi chú",
                                        dataIndex: "note",
                                    },
                                    {
                                        title: "Thao tác",
                                        dataIndex: "actions",
                                        width: 150,
                                        render: (_, record) => (
                                            <Space>
                                                <Popconfirm
                                                    title="Xóa thuốc này?"
                                                    onConfirm={() => handleRemoveMedicine(record)}
                                                >
                                                    <Button size="small" icon={<Delete className="w-4 h-4" />} danger />
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
