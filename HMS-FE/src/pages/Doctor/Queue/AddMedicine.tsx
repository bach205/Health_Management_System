import { Button, Empty, Flex, Form, InputNumber, Input } from "antd";
import type { IMedicine } from "../../../types/index.type";
import { useState } from "react";

interface AddMedicineProps {
    selectedMedicine: IMedicine | null;
    setSelectedMedicine: (value: IMedicine) => void;
    isCreate: boolean;
    handleAddMedicine: () => void;
}

const AddMedicine = ({ selectedMedicine, setSelectedMedicine, isCreate, handleAddMedicine }: AddMedicineProps) => {
    // console.log("selectedMedicine", selectedMedicine)

    const [isErrorDosage, setIsErrorDosage] = useState(false)
    const [isErrorFrequency, setIsErrorFrequency] = useState(false)
    const [isErrorQuantity, setIsErrorQuantity] = useState(false)

    const handleValidate = () => {
        setIsErrorDosage(false)
        setIsErrorFrequency(false)
        setIsErrorQuantity(false)
        let stop = false
        if (!selectedMedicine?.dosageAmount) {
            setIsErrorDosage(true)
            stop = true
        }
        if (!selectedMedicine?.frequencyAmount) {
            setIsErrorFrequency(true)
            stop = true
        }
        if (!selectedMedicine?.quantity) {
            setIsErrorQuantity(true)
            stop = true
        }

        if (stop) {
            return
        }
        handleAddMedicine()
    }
    return (
        selectedMedicine != null && (
            <>
                {
                    selectedMedicine.stock != null && selectedMedicine.stock > 0 ?
                        <>
                            <Form.Item label="Số lượng" layout="horizontal"  >
                                <Flex gap={4} align="center">
                                    <InputNumber
                                        min={1}
                                        placeholder="Nhập số lượng"
                                        max={selectedMedicine?.stock || 1000}
                                        value={selectedMedicine?.quantity}
                                        onChange={(value) =>
                                            setSelectedMedicine({ ...selectedMedicine, quantity: value || 1 })
                                        }
                                        style={{ width: '50%' }}
                                    />
                                    <div className="text-gray-500">Tồn kho: {selectedMedicine?.stock}</div>
                                </Flex>
                                {isErrorQuantity && <div className="text-red-500">Vui lòng nhập số lượng</div>}
                            </Form.Item>

                            <Form.Item label="Liều dùng" layout="horizontal">
                                <Flex className="w-full" gap={4} style={{ flexWrap: 'wrap' }}>
                                    <Flex gap={4} style={{ flex: 1 }}>
                                        <InputNumber
                                            style={{ width: '50%' }}
                                            min={1}
                                            max={selectedMedicine?.stock || 1000}
                                            placeholder="Số viên"
                                            value={selectedMedicine?.dosageAmount}
                                            onChange={(value) =>
                                                setSelectedMedicine({ ...selectedMedicine, dosageAmount: value || 1 })
                                            }
                                        />
                                        <span style={{ alignSelf: 'center' }}>viên / bữa</span>
                                    </Flex>
                                </Flex>
                                {isErrorDosage && <div className="text-red-500">Vui lòng nhập liều dùng</div>}
                            </Form.Item>
                            <Form.Item label="Tần suất" layout="horizontal">
                                <Flex gap={4} style={{ flex: 1 }}>
                                    <InputNumber
                                        min={1}
                                        placeholder="Số lần"
                                        max={selectedMedicine?.stock || 1000}
                                        value={selectedMedicine?.frequencyAmount}
                                        onChange={(value) =>
                                            setSelectedMedicine({ ...selectedMedicine, frequencyAmount: value || 1 })
                                        }
                                        style={{ width: '50%' }}
                                    />
                                    <span style={{ alignSelf: 'center' }}> bữa / ngày</span>
                                </Flex>
                                {isErrorFrequency && <div className="text-red-500">Vui lòng nhập tần suất</div>}
                            </Form.Item>

                            <Form.Item label="Ghi chú" layout="horizontal">

                                {/* //ghi chú */}
                                <Input.TextArea placeholder="Ghi chú (VD: uống sau khi ăn)"
                                    value={selectedMedicine?.note}
                                    onChange={(e) =>
                                        setSelectedMedicine({ ...selectedMedicine, note: e.target.value })
                                    }
                                />
                            </Form.Item>
                            <Button
                                type="primary"
                                className="mb-2"
                                onClick={() => { handleValidate() }}
                                disabled={!selectedMedicine}
                            >
                                {isCreate ? "Thêm" : "Cập nhật"}
                            </Button>

                        </>
                        :
                        <Empty description="Không còn thuốc" />
                }
            </>

        )
    );
}

export default AddMedicine;