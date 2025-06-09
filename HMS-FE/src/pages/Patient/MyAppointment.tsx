import {
    PlusCircleFilled,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input, Tooltip } from "antd";
import React, { useState } from "react";


import ScheduleTable from "./ScheduleTable";

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
    const [selectedAppointent, setSelectedAppointent] = useState(null);

    const handleViewAppointmentCancel = () => {
        setViewVisibleAppointmentModal(false);
        setSelectedAppointent(null);
    };
    const handleAddAppointmentCancel = (reset: any) => {
        setAddVisiableAppointment(false);

        if (!viewVisibleAppointmentModal) {
            setSelectedAppointent(null);
        }
        reset();
    };

    const handleViewAppointmentEdit = (record: any) => {
        setAddVisiableAppointment(true);
        setSelectedAppointent(record);
    };

    const handleAppointmentOk = async (values: any) => {
        try {
            setReload(!reload);
            setAddVisiableAppointment(false);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            <p className="pb-3 mt-12 font-medium text-zinc-700 border-b border-zinc-300">
                Lịch hẹn khám bệnh
            </p>
            <ScheduleTable
                onEdit={handleViewAppointmentEdit}
                onCancel={handleViewAppointmentCancel}
                visible={true}
                selectedPatient={patient}
                reload={reload}
                isPage
            />
        </div>
    );
}
