import {
    PlusCircleFilled,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input, Tooltip, Form, message } from "antd";
import React, { useEffect, useState } from "react";


import ScheduleTable from "./ScheduleTable";
import { getPatientAppointmentsService, updateAppointmentService } from "../../services/appointment.service";
import ModalUpdateAppointment from "./ModalUpdateAppointment";

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

    const handleViewAppointmentCancel = () => {
        setViewVisibleAppointmentModal(false);
        setSelectedAppointent(null);
        form.resetFields();
    };
    const handleAddAppointmentCancel = (reset: any) => {
        setAddVisiableAppointment(false);

        if (!viewVisibleAppointmentModal) {
            setSelectedAppointent(null);
        }
        reset();
    };

    const handleViewAppointmentEdit = (record: any) => {
        setSelectedAppointent(record);
        setViewVisibleAppointmentModal(true);
        form.setFieldsValue({
            specialty: record.specialty,
            doctor: record.doctorId,
            date: record.date ? record.date : null,
        });
    };

    const handleUpdateAppointment = async () => {
        try {
            const values = await form.validateFields();
            await updateAppointmentService(selectedAppointent._id || selectedAppointent.id, {
                ...values,
                date: values.date ? values.date.format("YYYY-MM-DD") : undefined,
            });
            message.success("Cập nhật lịch hẹn thành công");
            setViewVisibleAppointmentModal(false);
            setReload(r => !r);
        } catch (error) {
            message.error("Cập nhật lịch hẹn thất bại");
        }
    };

    return (
        <div>
            <p className="pb-3 mt-12 font-medium text-zinc-700 border-b border-zinc-300">
                Lịch hẹn khám bệnh
            </p>
            <ScheduleTable
                data={Array.isArray(appointments) ? appointments : []}
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
            />
        </div>
    );
}
