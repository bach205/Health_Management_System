import { DatePicker, Form, Input, Modal, Select, type FormInstance } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
// import { getDoctors } from "../../services/doctor.service";
// import { getWorkSchedulesService } from "../../services/workschedule.service";
import { getAllAvailableSlotsService } from "../../services/appointment.service";
// import { getClinics } from "../../services/clinic.service";

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
    const [allSlots, setAllSlots] = useState<any[]>([]);
    const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
    const [clinicOptions, setClinicOptions] = useState<any[]>([]);
    const [dateOptions, setDateOptions] = useState<any[]>([]);
    const [timeOptions, setTimeOptions] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
    const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Fetch all slots on open
    useEffect(() => {
        const fetchSlots = async () => {
            setLoading(true);
            try {
                const slots = await getAllAvailableSlotsService();
                setAllSlots(slots.data);
                // Group unique doctors
                const doctors = Array.from(new Map(slots.data.map((slot: any) => [slot.doctor_id, { id: slot.doctor_id, name: slot.doctor_name }])).values());
                setDoctorOptions(doctors.map((d: any) => ({ value: d.id, label: d.name })));
            } catch {
                setAllSlots([]);
                setDoctorOptions([]);
            } finally {
                setLoading(false);
            }
        };
        if (isVisible) fetchSlots();
        if (!isVisible) {
            setAllSlots([]);
            setDoctorOptions([]);
            setClinicOptions([]);
            setDateOptions([]);
            setTimeOptions([]);
            setSelectedDoctor(null);
            setSelectedClinic(null);
            setSelectedDate(null);
            form.resetFields();
        }
    }, [isVisible]);

    // Khi chọn bác sĩ, lọc ra các phòng khám hợp lệ
    const handleDoctorChange = (doctorId: number) => {
        setSelectedDoctor(doctorId);
        setSelectedClinic(null);
        setSelectedDate(null);
        setTimeOptions([]);
        setDateOptions([]);
        form.setFieldsValue({ clinic_id: undefined, appointment_date: undefined, appointment_time: undefined });
        const clinics = Array.from(new Map(allSlots.filter(slot => slot.doctor_id === doctorId).map(slot => [slot.clinic_id, { id: slot.clinic_id, name: slot.clinic_name }])).values());
        setClinicOptions(clinics.map((c: any) => ({ value: c.id, label: c.name })));
    };

    // Khi chọn phòng khám, lọc ra các ngày hợp lệ
    const handleClinicChange = (clinicId: number) => {
        setSelectedClinic(clinicId);
        setSelectedDate(null);
        setTimeOptions([]);
        form.setFieldsValue({ appointment_date: undefined, appointment_time: undefined });
        if (!selectedDoctor || !clinicId) {
            setDateOptions([]);
            return;
        }
        // Lọc ngày từ slot
        const dates = Array.from(new Set(allSlots.filter(slot => slot.doctor_id === selectedDoctor && slot.clinic_id === clinicId).map(slot => slot.slot_date)));
        setDateOptions(dates.map(date => ({ value: date, label: dayjs(date).format('DD/MM/YYYY') })));
    };

    // Khi chọn ngày, lọc ra các giờ hợp lệ
    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        setTimeOptions([]);
        form.setFieldsValue({ appointment_time: undefined });
        if (!selectedDoctor || !selectedClinic || !date) {
            setTimeOptions([]);
            return;
        }
        // Lọc giờ từ slot
        const times = allSlots.filter(slot => slot.doctor_id === selectedDoctor && slot.clinic_id === selectedClinic && slot.slot_date === date);
        setTimeOptions(times.map((slot: any) => ({ value: slot.start_time, label: slot.start_time.slice(11, 16) })));
    };

    // Set initial values when modal opens
    useEffect(() => {
        if (isVisible && selectedAppointment) {
            // Set doctor and fetch clinics for that doctor
            setSelectedDoctor(selectedAppointment.doctor_id);
            // Filter clinics for the selected doctor
            const clinics = Array.from(new Map(allSlots.filter(slot => slot.doctor_id === selectedAppointment.doctor_id).map(slot => [slot.clinic_id, { id: slot.clinic_id, name: slot.clinic_name }])).values());
            setClinicOptions(clinics.map((c: any) => ({ value: c.id, label: c.name })));
            setSelectedClinic(selectedAppointment.clinic_id);
            // Filter dates for the selected doctor and clinic
            const dates = Array.from(new Set(allSlots.filter(slot => slot.doctor_id === selectedAppointment.doctor_id && slot.clinic_id === selectedAppointment.clinic_id).map(slot => slot.slot_date)));
            setDateOptions(dates.map(date => ({ value: date, label: dayjs(date).format('DD/MM/YYYY') })));
            setSelectedDate(selectedAppointment.formatted_date);
            // Filter times for the selected doctor, clinic, and date
            const times = allSlots.filter(slot => slot.doctor_id === selectedAppointment.doctor_id && slot.clinic_id === selectedAppointment.clinic_id && slot.slot_date === selectedAppointment.formatted_date);
            setTimeOptions(times.map((slot: any) => ({ value: slot.start_time, label: slot.start_time.slice(11, 16) })));
            // Set form fields
            form.setFieldsValue({
                clinic_id: selectedAppointment.clinic_id,
                doctor_id: selectedAppointment.doctor_id,
                appointment_date: typeof selectedAppointment.formatted_date === 'string' ? selectedAppointment.formatted_date : undefined,
                appointment_time: typeof selectedAppointment.formatted_time === 'string' ? selectedAppointment.formatted_time : undefined,
                reason: selectedAppointment.reason || "",
                note: selectedAppointment.note || "",
            });
        }
    }, [isVisible, selectedAppointment, allSlots, form]);

    // Nếu lý do là Tái khám thì disable form
    const isTaiKham = selectedAppointment?.reason?.trim() === 'Tái khám';

    const handleSubmit = async () => {
        console.log(clinicOptions);
        try {
            setLoading(true);
            const values = await form.validateFields();

            const updateData = {
                clinic_id: values.clinic_id,
                doctor_id: values.doctor_id,
                appointment_date: new Date(values.appointment_date),
                appointment_time: new Date(values.appointment_time),
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
            okButtonProps={{ disabled: isTaiKham }}
        >
            <Form
                name="updateAppointmentForm"
                form={form}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ marginTop: 20, opacity: isTaiKham ? 0.6 : 1, pointerEvents: isTaiKham ? 'none' : 'auto' }}
                layout="vertical"
                disabled={isTaiKham}
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
                        value={doctorOptions.find(opt => opt.value === form.getFieldValue('doctor_id')) ? form.getFieldValue('doctor_id') : undefined}
                        optionLabelProp="label"
                    />
                </Form.Item>
                <Form.Item
                    label="Phòng khám"
                    name="clinic_id"
                    rules={[{ required: true, message: "Vui lòng chọn phòng khám!" }]}
                >
                    <Select
                        placeholder="Chọn phòng khám"
                        options={clinicOptions}
                        onChange={(value) => handleClinicChange(Number(value))}
                        showSearch
                        optionFilterProp="label"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        value={clinicOptions.find(opt => opt.value === form.getFieldValue('clinic_id')) ? form.getFieldValue('clinic_id') : undefined}
                        optionLabelProp="label"
                    />
                </Form.Item>
                <Form.Item
                    label="Ngày Đặt Lịch"
                    name="appointment_date"
                    rules={[{ required: true, message: "Vui lòng chọn Ngày Đặt Lịch!" }]}
                >
                    <Select
                        placeholder="Chọn Ngày Đặt Lịch"
                        options={dateOptions}
                        onChange={(value) => handleDateChange(value as string)}
                        showSearch
                        optionFilterProp="label"
                        disabled={!selectedClinic}
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
                            <div><span className="font-medium">Bác sĩ:</span> {selectedAppointment.doctor_id || "Chưa xác định"}</div>
                            <div><span className="font-medium">Chuyên khoa:</span> {selectedAppointment.clinic_name || "Chưa xác định"}</div>
                            <div><span className="font-medium">Trạng thái:</span>
                                {(() => {
                                    let color = "default";
                                    let text = selectedAppointment.status;
                                    if (selectedAppointment.status === "pending") { color = "gold"; text = "Chờ xác nhận"; }
                                    else if (selectedAppointment.status === "confirmed") { color = "green"; text = "Đã xác nhận"; }
                                    else if (selectedAppointment.status === "cancelled") { color = "red"; text = "Đã hủy"; }
                                    else if (selectedAppointment.status === "completed") { color = "blue"; text = "Khám xong"; }
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
