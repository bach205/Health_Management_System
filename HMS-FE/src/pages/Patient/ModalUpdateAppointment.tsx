import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { getDoctorsInClinic } from "../../services/doctor.service";
import { getWorkSchedulesService } from "../../services/workschedule.service";
import { getAllAvailableSlotsService } from "../../services/appointment.service";

interface IProps {
    isVisible: boolean;
    handleOk: (data: any) => void;
    handleCancel: () => void;
    form: FormInstance;
    role: string;
    selectedAppointment?: any;
}

const ModalUpdateAppointment = ({ role, isVisible, handleOk, handleCancel, form, selectedAppointment }: IProps) => {
    const [loading, setLoading] = useState(false);
    const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
    const [dateOptions, setDateOptions] = useState<any[]>([]);
    const [timeOptions, setTimeOptions] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Fetch doctors in clinic on open
    useEffect(() => {
        const fetchDoctors = async () => {
            if (!selectedAppointment?.clinic_id) return;
            setLoading(true);
            try {
                const res = await getDoctorsInClinic(selectedAppointment.clinic_id);
                const doctors = (res.data?.metadata || res.data)?.map((d: any) => ({ value: d.id, label: d.full_name }));
                setDoctorOptions(doctors);
            } catch {
                setDoctorOptions([]);
            } finally {
                setLoading(false);
            }
        };
        if (isVisible) fetchDoctors();
        if (!isVisible) {
            setDoctorOptions([]);
            setDateOptions([]);
            setTimeOptions([]);
            setSelectedDoctor(null);
            setSelectedDate(null);
            form.resetFields();
        }
    }, [isVisible, selectedAppointment]);

    // When doctor changes, fetch work schedule dates
    const handleDoctorChange = async (doctorId: number) => {
        setSelectedDoctor(doctorId);
        setSelectedDate(null);
        setTimeOptions([]);
        form.setFieldsValue({ appointment_date: undefined, appointment_time: undefined });
        if (!doctorId || !selectedAppointment?.clinic_id) {
            setDateOptions([]);
            return;
        }
        setLoading(true);
        try {
            const res = await getWorkSchedulesService();
            // Unique dates
            const dates = Array.from(new Set((res.data || res).map((ws: any) => ws.work_date)));
            setDateOptions(dates.map(date => ({ value: date, label: dayjs(date).format('DD/MM/YYYY') })));
        } catch {
            setDateOptions([]);
        } finally {
            setLoading(false);
        }
    };

    // When date changes, fetch available slots
    const handleDateChange = async (date: string) => {
        setSelectedDate(date);
        setTimeOptions([]);
        form.setFieldsValue({ appointment_time: undefined });
        if (!selectedDoctor || !selectedAppointment?.clinic_id || !date) {
            setTimeOptions([]);
            return;
        }
        setLoading(true);
        try {
            const slots = await getAllAvailableSlotsService();
            setTimeOptions(slots.map((slot: any) => ({ value: slot.start_time, label: slot.start_time.slice(0,5) })));
        } catch {
            setTimeOptions([]);
        } finally {
            setLoading(false);
        }
    };

    // Set initial values when modal opens
    useEffect(() => {
        if (isVisible && selectedAppointment) {
            form.setFieldsValue({
                doctor_id: selectedAppointment.doctor_id,
                appointment_date: selectedAppointment.formatted_date || undefined,
                appointment_time: selectedAppointment.formatted_time || undefined,
                reason: selectedAppointment.reason || "",
                note: selectedAppointment.note || "",
            });
            setSelectedDoctor(selectedAppointment.doctor_id);
            setSelectedDate(selectedAppointment.formatted_date);
        }
    }, [isVisible, selectedAppointment, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const updateData = {
                doctor_id: values.doctor_id,
                appointment_date: values.appointment_date,
                appointment_time: values.appointment_time,
                reason: values.reason || undefined,
                note: values.note || undefined,
            };
            handleOk(updateData);
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
                    label="Bác sĩ"
                    name="doctor_id"
                    rules={[{ required: true, message: "Vui lòng chọn bác sĩ!" }]}
                >
                    <Select
                        placeholder="Chọn bác sĩ"
                        options={doctorOptions}
                        onChange={(value) => handleDoctorChange(Number(value))}
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    />
                </Form.Item>
                <Form.Item
                    label="Ngày khám"
                    name="appointment_date"
                    rules={[{ required: true, message: "Vui lòng chọn ngày khám!" }]}
                >
                    <Select
                        placeholder="Chọn ngày khám"
                        options={dateOptions}
                        onChange={(value) => handleDateChange(value as string)}
                        showSearch
                        optionFilterProp="label"
                        disabled={!selectedDoctor}
                    />
                </Form.Item>
                <Form.Item
                    label="Giờ khám"
                    name="appointment_time"
                    rules={[{ required: true, message: "Vui lòng chọn giờ khám!" }]}
                >
                    <Select
                        placeholder="Chọn giờ khám"
                        options={timeOptions}
                        showSearch
                        optionFilterProp="label"
                        disabled={!selectedDate}
                    />
                </Form.Item>
                <Form.Item label="Lý do khám" name="reason">
                    <Input.TextArea placeholder="Nhập lý do khám (tuỳ chọn)" rows={3} maxLength={500} showCount />
                </Form.Item>
                <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea placeholder="Nhập ghi chú (tuỳ chọn)" rows={3} maxLength={500} showCount />
                </Form.Item>
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
