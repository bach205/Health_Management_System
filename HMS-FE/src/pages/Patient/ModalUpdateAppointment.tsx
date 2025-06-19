import { DatePicker, Form, Input, Modal, Select, TimePicker, type FormInstance } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

interface IProps {
    isVisible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance;
    role: string;
    selectedAppointment?: any;
}

const ModalUpdateAppointment = ({ role, isVisible, handleOk, handleCancel, form, selectedAppointment }: IProps) => {
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isVisible && selectedAppointment) {
            form.setFieldsValue({
                appointment_date: selectedAppointment.formatted_date ? dayjs(selectedAppointment.formatted_date) : null,
                appointment_time: selectedAppointment.formatted_time ? dayjs(`2000-01-01 ${selectedAppointment.formatted_time}`) : null,
                reason: selectedAppointment.reason || "",
                note: selectedAppointment.note || "",
            });
        } else if (!isVisible) {
            form.resetFields();
        }
    }, [isVisible, selectedAppointment, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            // Format data for API
            const updateData = {
                appointment_date: values.appointment_date ? values.appointment_date.format("YYYY-MM-DD") : undefined,
                appointment_time: values.appointment_time ? values.appointment_time.format("HH:mm:ss") : undefined,
                reason: values.reason || undefined,
                note: values.note || undefined,
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            handleOk();
        } catch (error) {
            console.error("Form validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={isVisible}
            title="Cập nhật lịch hẹn khám"
            onOk={handleSubmit}
            okText="Cập nhật"
            cancelText="Hủy"
            onCancel={handleCancel}
            destroyOnClose
            centered
            confirmLoading={loading}
            width={600}
        >
            <Form
                name="updateAppointmentForm"
                form={form}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ marginTop: 20 }}
                layout="vertical"
            >
                <Form.Item
                    label="Ngày khám"
                    name="appointment_date"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn ngày khám!",
                        },
                    ]}
                >
                    <DatePicker 
                        format="DD/MM/YYYY" 
                        placeholder="Chọn ngày khám"
                        style={{ width: '100%' }}
                        disabledDate={(current) => {
                            // Disable past dates
                            return current && current < dayjs().startOf('day');
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Giờ khám"
                    name="appointment_time"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn giờ khám!",
                        },
                    ]}
                >
                    <TimePicker 
                        format="HH:mm" 
                        placeholder="Chọn giờ khám"
                        style={{ width: '100%' }}
                        minuteStep={15}
                    />
                </Form.Item>

                <Form.Item
                    label="Lý do khám"
                    name="reason"
                >
                    <Input.TextArea 
                        placeholder="Nhập lý do khám (tuỳ chọn)"
                        rows={3}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                <Form.Item
                    label="Ghi chú"
                    name="note"
                >
                    <Input.TextArea 
                        placeholder="Nhập ghi chú (tuỳ chọn)"
                        rows={3}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>

                {/* Display current information (read-only) */}
                {selectedAppointment && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                        <h4 className="font-medium text-gray-700 mb-3">Thông tin hiện tại:</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Bác sĩ:</span> {selectedAppointment.doctor_name || "Chưa xác định"}</div>
                            <div><span className="font-medium">Chuyên khoa:</span> {selectedAppointment.clinic_name || "Chưa xác định"}</div>
                            <div><span className="font-medium">Trạng thái:</span> 
                                {(() => {
                                    let color = "default";
                                    let text = selectedAppointment.status;
                                    if (selectedAppointment.status === "pending") { color = "gold"; text = "Chờ xác nhận"; }
                                    else if (selectedAppointment.status === "confirmed") { color = "green"; text = "Đã xác nhận"; }
                                    else if (selectedAppointment.status === "cancelled") { color = "red"; text = "Đã hủy"; }
                                    else if (selectedAppointment.status === "completed") { color = "blue"; text = "Đã hoàn thành"; }
                                    return <span className={`inline-block px-2 py-1 rounded text-xs bg-${color}-100 text-${color}-800`}>{text}</span>;
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default ModalUpdateAppointment;
