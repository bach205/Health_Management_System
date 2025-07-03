import { useState } from "react";
import {
    Table, Button, Form, Input, Select, Tooltip, Popconfirm,
    Flex, Space, Typography, notification, Tag
} from "antd";
import { CirclePlus, Eye, RefreshCcw, Search, Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import ModalCreateMedicine from "./ModalCreateMedicine";
import ModalUpdateMedicine from "./ModalUpdateMedicine";
import { useMedicineList } from "../../../hooks/useMedicineList";
import { createMedicine, updateMedicine, deleteMedicine } from "../../../services/medicine.service";
import UserListTitle from "../../../components/ui/UserListTitle";
import { sortOptions } from "../../../constants/user.const";

const AdminMedicineDashboard = () => {
    const [isCreateVisible, setIsCreateVisible] = useState(false);
    const [isUpdateVisible, setIsUpdateVisible] = useState(false);
    const [currentMedicine, setCurrentMedicine] = useState<any>(null);
    const [formCreate] = Form.useForm();
    const [formUpdate] = Form.useForm();

    const {
        medicines, loading, keyword, reload, pagination, sort, setSort,
        setKeyword, setReload, handleTableChange
    } = useMedicineList();

    const columns: any = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            align: "center",
            render: (_: any, __: any, index: number) => index + 1,
            width: 60,
        },
        {
            title: "Tên thuốc",
            dataIndex: "name",
            key: "name",
            width: 200,
        },
        {
            title: "Số lượng",
            dataIndex: "stock",
            key: "stock",
            align: "center",
            width: 100,
        },
        {
            title: "Giá tiền",
            dataIndex: "price",
            key: "price",
            align: "right",
            width: 100,
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<Pencil size={17.5} />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        okText="Xác nhận"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" icon={<Trash2 size={17.5} />} danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleCreateOk = async () => {
        try {
            const values = await formCreate.validateFields();
            await createMedicine(values);
            notification.success({ message: "Thêm thuốc thành công" });
            setIsCreateVisible(false);
            setReload(!reload);
        } catch (error: any) {
            console.log("error", error)
            if (error?.response?.data) {
                notification.error({ message: error.response.data.message });
            } else if (error?.errorFields?.length > 0) {
                notification.error({ message: error.errorFields[0].errors[0] });
            } else {
                notification.error({ message: "Có lỗi xảy ra" });
            }
        }
    };

    const handleUpdateOk = async () => {
        try {
            const values = await formUpdate.validateFields();
            await updateMedicine({ ...values, id: currentMedicine.id });
            notification.success({ message: "Cập nhật thuốc thành công" });
            setIsUpdateVisible(false);
            setReload(!reload);
        } catch (error: any) {
            console.log("error", error)
            if (error?.response?.data) {
                notification.error({ message: error.response.data.message });
            } else if (error?.errorFields?.length > 0) {
                notification.error({ message: error.errorFields[0].errors[0] });
            } else {
                notification.error({ message: "Có lỗi xảy ra" });
            }
        }
    };

    const handleEdit = (record: any) => {
        setCurrentMedicine(record);
        formUpdate.setFieldsValue(record);
        setIsUpdateVisible(true);
    };

    const handleDelete = async (record: any) => {
        try {
            await deleteMedicine(record.id);
            notification.success({ message: "Xóa thuốc thành công" });
            setReload(!reload);
        } catch (error: any) {
            console.log("error", error)
            if (error?.response?.data) {
                notification.error({ message: error.response.data.message });
            } else if (error?.errorFields?.length > 0) {
                notification.error({ message: error.errorFields[0].errors[0] });
            } else {
                notification.error({ message: "Có lỗi xảy ra" });
            }
        }
    };
    const handleResetFilter = () => {
        setKeyword("");
        setSort("name_asc");
        setReload(!reload);
    }

    return (
        <div>
            <UserListTitle title="thuốc" />
            <Flex justify="space-between" style={{ marginBottom: 10 }}>
                <Flex gap={10}>
                    <Tooltip title="Hủy lọc">
                        <Button onClick={handleResetFilter}>
                            <RefreshCcw size={17.5} />
                        </Button>
                    </Tooltip>
                    <Input
                        value={keyword}
                        placeholder="Tìm kiếm tên thuốc"
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={() => setReload(!reload)}
                    />
                    <Button type="primary" onClick={() => setReload(!reload)}>
                        <Search size={17.5} />
                    </Button>
                </Flex>
                <Button type="primary" icon={<CirclePlus size={16} />} onClick={() => setIsCreateVisible(true)}>
                    Thêm thuốc
                </Button>
            </Flex>
            <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
                <Form>
                    <Flex gap={10}>

                        <Form.Item label="Sắp xếp" style={{ width: '220px' }} name="sort" valuePropName="sort" >
                            <Select
                                style={{ width: 150 }}
                                value={sort}
                                onChange={(value) => setSort(value)}
                                options={[
                                    { value: "name_asc", label: "Tên A-Z" },
                                    { value: "name_desc", label: "Tên Z-A" },
                                    { value: "price_asc", label: "Giá tăng dần" },
                                    { value: "price_desc", label: "Giá giảm dần" },
                                    { value: "stock_asc", label: "Số lượng tăng dần" },
                                    { value: "stock_desc", label: "Số lượng giảm dần" },
                                ]}
                            />
                        </Form.Item>

                    </Flex>
                </Form>
            </Flex>
            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={medicines}
                pagination={pagination}
                onChange={(e: any) => handleTableChange(e)}
                scroll={{ x: 1000, y: 500 }}
            />

            <ModalCreateMedicine
                form={formCreate}
                isVisible={isCreateVisible}
                handleOk={handleCreateOk}
                handleCancel={() => setIsCreateVisible(false)}
            />

            <ModalUpdateMedicine
                form={formUpdate}
                isVisible={isUpdateVisible}
                handleOk={handleUpdateOk}
                handleCancel={() => setIsUpdateVisible(false)}
                medicine={currentMedicine}
                reload={reload}
                setReload={setReload}
            />
        </div>
    );
};

export default AdminMedicineDashboard;
