import {
    PlusCircleFilled,
    ReloadOutlined,
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input, Tooltip, Form, message, Select, DatePicker, Space, Card, Row, Col, Dropdown, Menu } from "antd";
import React, { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

import ScheduleTable from "./ScheduleTable";
import { getPatientAppointmentsService, updateAppointmentService, getAllAvailableSlotsService } from "../../services/appointment.service";
import ModalUpdateAppointment from "./ModalUpdateAppointment";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function AppointmentsPage() {
    const [viewVisibleAppointmentModal, setViewVisibleAppointmentModal] =
        useState(false);
    const patient = {
        _id: "1",
        name: "John Doe",
        speciality: "Cardiologist",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    };
    const [reload, setReload] = useState(false);
    const [addVisiableAppointment, setAddVisiableAppointment] = useState(false);
    const [selectedAppointent, setSelectedAppointent] = useState<any>(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const patientId = localStorage.getItem("user");

    // Filter states
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [dateRange, setDateRange] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);
    // Thêm filter bác sĩ và phòng khám
    const [doctorFilter, setDoctorFilter] = useState<number | null>(null);
    const [clinicFilter, setClinicFilter] = useState<number | null>(null);
    const [doctorOptions, setDoctorOptions] = useState<{ value: number, label: string }[]>([]);
    const [clinicOptions, setClinicOptions] = useState<{ value: number, label: string }[]>([]);
    // Sắp xếp
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc");

    const navigate = useNavigate();
    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const data = await getPatientAppointmentsService(JSON.parse(patientId || "").id);
                console.log(data.data);
                setAppointments(Array.isArray(data) ? data : (data?.data ?? []));
            } catch (error) {
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [patientId, reload]);

    useEffect(() => {
        // Lấy danh sách bác sĩ và phòng khám từ slot
        const fetchDoctorsAndClinics = async () => {
            try {
                const slots = await getAllAvailableSlotsService();
                const slotArr: any[] = Array.isArray(slots.data) ? slots.data : [];
                const doctors = Array.from(new Map(slotArr.map((slot: any) => [slot.doctor_id, { value: slot.doctor_id, label: slot.doctor_name }])).values());
                setDoctorOptions(doctors as { value: number, label: string }[]);
                const clinics = Array.from(new Map(slotArr.map((slot: any) => [slot.clinic_id, { value: slot.clinic_id, label: slot.clinic_name }])).values());
                setClinicOptions(clinics as { value: number, label: string }[]);
            } catch {
                setDoctorOptions([]);
                setClinicOptions([]);
            }
        };
        fetchDoctorsAndClinics();
    }, []);

    const handleViewAppointmentCancel = () => {
        setViewVisibleAppointmentModal(false);
        setSelectedAppointent(null);
        form.resetFields();
    };

    const handleViewAppointmentEdit = (record: any) => {
        setSelectedAppointent(record);
        setViewVisibleAppointmentModal(true);
        form.setFieldsValue({
            appointment_date: typeof record.formatted_date === 'string' ? dayjs(record.formatted_date) : null,
            appointment_time: typeof record.formatted_time === 'string' ? dayjs(`2000-01-01 ${record.formatted_time}`) : null,
            reason: record.reason || "",
            note: record.note || "",
        });
    };

    const handleUpdateAppointment = async (updateData?: any) => {
        try {
            let values = updateData;
            console.log(values);
            if (!values) {
                values = await form.validateFields();
            }
            await updateAppointmentService(selectedAppointent._id || selectedAppointent.id, values);
            message.success("Cập nhật lịch hẹn thành công");
            setViewVisibleAppointmentModal(false);
            setReload(r => !r);
        } catch (error) {
            message.error("Cập nhật lịch hẹn thất bại");
        }
    };

    // Filtered appointments
    const filteredAppointments = useMemo(() => {
        let filtered = appointments;

        // Search filter
        if (searchSubmitted) {
            filtered = filtered.filter((appointment: any) => {
                const searchLower = searchSubmitted.toLowerCase();
                return (
                    (appointment.doctor_name?.toLowerCase() || '').includes(searchLower) ||
                    (appointment.clinic_name?.toLowerCase() || '').includes(searchLower) ||
                    (appointment.formatted_date?.toLowerCase() || '').includes(searchLower) ||
                    (appointment.formatted_time?.toLowerCase() || '').includes(searchLower)
                );
            });
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter((appointment: any) =>
                appointment.status === statusFilter
            );
        }

        // Date range filter
        if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].startOf('day');
            const endDate = dateRange[1].endOf('day');
            filtered = filtered.filter((appointment: any) => {
                if (!appointment.formatted_date) return false;
                try {
                    const appointmentDate = dayjs(appointment.formatted_date);
                    if (!appointmentDate.isValid()) return false;
                    return appointmentDate.isBetween(startDate, endDate, 'day', '[]');
                } catch (error) {
                    return false;
                }
            });
        }
        // Lọc theo bác sĩ
        if (doctorFilter) {
            filtered = filtered.filter((appointment: any) =>
                appointment.doctor_id === doctorFilter ||
                appointment.doctor?._id === doctorFilter ||
                appointment.doctor_id === String(doctorFilter)
            );
        }
        // Lọc theo phòng khám
        if (clinicFilter) {
            filtered = filtered.filter((appointment: any) =>
                appointment.clinic_id === clinicFilter ||
                appointment.clinic?._id === clinicFilter ||
                appointment.clinic_id === String(clinicFilter)
            );
        }

        // Sắp xếp theo giờ dự kiến
        filtered = filtered.slice().sort((a: any, b: any) => {
            // Ưu tiên sort theo ngày, sau đó đến giờ
            const dateA = a.formatted_date ? dayjs(a.formatted_date, ["DD/MM/YYYY", "YYYY-MM-DD"]) : null;
            const dateB = b.formatted_date ? dayjs(b.formatted_date, ["DD/MM/YYYY", "YYYY-MM-DD"]) : null;
            if (dateA && dateB && dateA.isValid() && dateB.isValid()) {
                if (dateA.isBefore(dateB)) return sortOrder === 'asc' ? -1 : 1;
                if (dateA.isAfter(dateB)) return sortOrder === 'asc' ? 1 : -1;
            }
            // Nếu ngày giống nhau, so sánh giờ
            const timeA = a.formatted_time ? dayjs(a.formatted_time, ["HH:mm", "HH:mm:ss"]) : null;
            const timeB = b.formatted_time ? dayjs(b.formatted_time, ["HH:mm", "HH:mm:ss"]) : null;
            if (timeA && timeB && timeA.isValid() && timeB.isValid()) {
                if (timeA.isBefore(timeB)) return sortOrder === 'asc' ? -1 : 1;
                if (timeA.isAfter(timeB)) return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return filtered;
    }, [appointments, searchSubmitted, statusFilter, dateRange, doctorFilter, clinicFilter, sortOrder]);

    // Clear all filters
    const clearFilters = () => {
        setSearchText("");
        setSearchSubmitted("");
        setStatusFilter("");
        setDateRange(null);
        setDoctorFilter(null);
        setClinicFilter(null);
    };

    return (
        <div>
            <p className="pb-3 mt-12 font-medium text-zinc-700 border-b border-zinc-300">
                Lịch hẹn khám bệnh
            </p>

            {/* Search and Filter Section */}
            <Card className="mb-4" size="small">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder="Tìm kiếm"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={() => setSearchSubmitted(searchText)}
                            style={{ marginRight: 8 }}
                        >
                            Tìm kiếm
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSearchText("");
                                setSearchSubmitted("");
                            }}
                        >
                            Reset
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Button
                            type={showFilters ? "primary" : "default"}
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Bộ lọc
                        </Button>
                        {(searchSubmitted || statusFilter || dateRange || doctorFilter || clinicFilter) && (
                            <Button
                                type="text"
                                icon={<ClearOutlined />}
                                onClick={clearFilters}
                                className="ml-2"
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </Col>
                    <Col>
                        <Button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            icon={<ReloadOutlined rotate={sortOrder === 'asc' ? 0 : 180} />}
                        >
                            Sắp xếp theo giờ {sortOrder === 'asc' ? '(Tăng dần)' : '(Giảm dần)'}
                    </Button>
                    </Col>
                    <Button className="ml-auto" type="default" onClick={() => navigate("/queue")}>Xem hàng chờ</Button>
                </Row>

                {showFilters && (
                    <Row gutter={[16, 16]} className="mt-4">
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                allowClear
                                style={{ width: '100%' }}
                                options={[
                                    { value: "", label: "Tất cả" },
                                    { value: "pending", label: "Chờ xác nhận" },
                                    { value: "confirmed", label: "Đã xác nhận" },
                                    { value: "cancelled", label: "Đã hủy" },
                                    { value: "completed", label: "Đã hoàn thành" },
                                ]}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <DatePicker.RangePicker
                                placeholder={["Từ ngày", "Đến ngày"]}
                                value={dateRange}
                                onChange={setDateRange}
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                placeholder="Lọc theo bác sĩ"
                                value={doctorFilter}
                                onChange={setDoctorFilter}
                                allowClear
                                style={{ width: '100%' }}
                                options={doctorOptions}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                placeholder="Lọc theo phòng khám"
                                value={clinicFilter}
                                onChange={setClinicFilter}
                                allowClear
                                style={{ width: '100%' }}
                                options={clinicOptions}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Col>
                    </Row>
                )}
            </Card>

            {/* Results summary */}
            {(searchSubmitted || statusFilter || dateRange) && (
                <div className="mb-4 text-sm text-gray-600">
                    Hiển thị {filteredAppointments.length} kết quả
                    {appointments.length !== filteredAppointments.length && (
                        <span> trong tổng số {appointments.length} lịch hẹn</span>
                    )}
                </div>
            )}

            <ScheduleTable
                data={filteredAppointments}
                loading={loading}
                onEdit={handleViewAppointmentEdit}
                onCancel={handleViewAppointmentCancel}
                visible={true}
                selectedPatient={patient}
                setReload={setReload}
                reload={reload}
                isPage
            />
            <ModalUpdateAppointment
                isVisible={viewVisibleAppointmentModal}
                handleOk={handleUpdateAppointment}
                handleCancel={handleViewAppointmentCancel}
                form={form}
                role={"patient"}
                selectedAppointment={selectedAppointent}
            />
        </div>
    );
}
