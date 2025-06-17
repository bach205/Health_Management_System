import { Button, Modal, Table } from "antd";
import { useEffect, useState } from "react";
import { getPatientExaminationOrder } from "../../../services/patient.service";
const ModalPatientExaminationOrder = ({ open, onClose, patient }: { open: boolean, onClose: () => void, patient: any }) => {
    const [examinationOrders, setExaminationOrders] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({
        pageNumber: 1,
        pageSize: 5,
    });
    useEffect(() => {
        const fetchExaminationOrders = async () => {
            const res = await getPatientExaminationOrder(patient.id);
            console.log(res.data.metadata);
            setExaminationOrders(res.data.metadata);
        };
        fetchExaminationOrders();
    }, [patient]);
    const columns = [
        {
            title: "STT",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Bác sĩ khám",
            dataIndex: "doctor_id",
            key: "doctor_id",
            render: (_: any, record: any) => record?.doctor?.full_name || "-",
        },
        {
            title: "Chuyển từ phòng",
            dataIndex: "fromClinic",
            key: "fromClinic",
            render: (fromClinic: any) => fromClinic?.name || "-",
        },
        {
            title: "Chuyển tới phòng",
            dataIndex: "toClinic",
            key: "toClinic",
            render: (toClinic: any) => toClinic?.name || "-",
        },

    ];
    return (
        <Modal open={open} onCancel={onClose} width={1000} title="Lịch sử chuyển phòng" footer={<Button type="primary" onClick={onClose}>Đóng</Button>}>
            <Table
                columns={columns}
                dataSource={examinationOrders}
                pagination={pagination}
                onChange={(pagination: any) => setPagination(pagination)}
            />
        </Modal>
    );
}

export default ModalPatientExaminationOrder;