import { useState } from "react";
import { Table, Tag, Space, Flex, Button, Form, Input, Select, notification, Tooltip, Popconfirm } from "antd";
import { Ban, CirclePlus, Eye, RefreshCcw, RotateCcw, Search, UserRoundPen } from "lucide-react";
import dayjs from "dayjs";
import { usePatientList } from "../../../hooks/usePatientList";
import ModalViewUser from "../../../components/modal/ModalViewUser";
import { sortOptions } from "../../../constants/user.const";
import type { IPatient } from "../../../types/index.type";
import UserListTitle from "../../../components/ui/UserListTitle";
import { createPatient, updatePatient, updatePassword, updateStatus } from "../../../services/patient.service";
import ModalCreatePatient from "../../../components/modal/ModalCreatePatient";
const AdminPatientDashboard = () => {
    const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);
    const [isViewVisible, setIsViewVisible] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<IPatient | null>(null);

    const [formCreate] = Form.useForm();
    const [formView] = Form.useForm();

    // Table column
    const columns: any = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            width: 60,
            align: "center" as const,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 150,
            ellipsis: true,
        },
        {
            title: "Họ tên",
            dataIndex: "full_name",
            width: 170,
            key: "full_name",
        },
        {
            width: 90,
            ellipsis: true,
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            render: (gender: 'male' | 'female' | 'other') => {
                return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : gender === 'other' ? 'Khác' : '-';
            },
        },
        {
            width: 120,
            title: "Điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            width: 120,
            title: "CMND/CCCD",
            dataIndex: "patient",
            key: "identity_number",
            render: (record: any) => record?.identity_number || '-',
        },
        {
            width: 150,
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (_: any, { is_active }: IPatient) => (
                <>
                    <Tag color={is_active ? "green" : "red"}>
                        {is_active ? "Đang hoạt động" : "Đã khóa"}
                    </Tag>
                </>
            ),
        },
        // action
        {
            title: "Hành động",
            fixed: "right",
            align: "center",
            width: 170,
            ellipsis: true,
            key: "action",
            render: (_: any, record: IPatient) => (
                <Space size="small">
                    <Tooltip title="Xem thông tin">
                        <Button
                            type="text"
                            onClick={() => handleView(record)}
                            icon={<Eye size={17.5} />}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Khôi phục mật khẩu"
                        description="Mật khẩu sẽ được khôi phục và gửi về email"
                        onConfirm={() => handleResetPassword(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Khôi phục mật khẩu" placement="topRight">
                            <Button type="text" icon={<RotateCcw size={17.5} />} />
                        </Tooltip>
                    </Popconfirm>
                    <Popconfirm
                        title={record?.is_active ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
                        description="Bạn chắc chắn muốn thực hiện hành động này?"
                        onConfirm={() => handleStatus(record)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button
                            type="text"
                            icon={<Ban size={17.5} style={{ color: record?.is_active ? undefined : 'red' }} />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // is active
    const handleStatus = async (record: IPatient) => {
        try {
            await updateStatus(record.id, !record.is_active);
            notification.success({ message: "Cập nhật trạng thái thành công" });
            setReload(!reload);
        } catch (error: any) {
            console.log(error);
            notification.error({ message: error.response?.data?.message || "Có lỗi xảy ra" });
        }
    };

    const handleView = async (record: IPatient) => {
        try {
            formView.setFieldsValue({
                ...record,
                date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
                identity_number: record.patient?.identity_number,
            });
            setIsViewVisible(true);
        } catch (error) {
            console.log(error);
            notification.error({ message: "Có lỗi xảy ra" });
        }
    };



    const handleResetPassword = async (id: number) => {
        try {
            await updatePassword(id);
            notification.success({ message: "Khôi phục mật khẩu thành công" });
            setReload(!reload);
        } catch (error: any) {
            console.log(error);
            if (error?.response?.data) {
                notification.error({ message: error.response.data.message });
            } else {
                notification.error({ message: "Có lỗi xảy ra" });
            }
        }
    }

    const handleCreateCancel = () => {
        setIsCreateVisible(false);
    };


    const handleViewCancel = () => {
        setIsViewVisible(false);
    };

    //Submit create patient
    const handleCreateOk = async () => {
        try {
            const values = await formCreate.validateFields();
            const createValue = {
                ...values,
                password: values.password || "",
            }
            delete createValue.confirm_password;
            await createPatient(createValue);
            notification.success({ message: "Tạo bệnh nhân thành công" });
            setReload(!reload);
            setIsCreateVisible(false);
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
        setSort("newest");
        setIsActive("all");
    }

    // custom hook
    const {
        users, loading, keyword, reload, sort, pagination, isActive,
        setKeyword, setReload, setSort, setIsActive, handleTableChange,
    } = usePatientList();

    // console.log(users);

    return (
        <div>
            <UserListTitle title="bệnh nhân" />

            {/* filter bar */}
            <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
                <Flex gap={10}>
                    <Tooltip title="Hủy lọc">
                        <Button onClick={() => handleResetFilter()}>
                            <RefreshCcw size={17.5} />
                        </Button>
                    </Tooltip>
                    <Input
                        value={keyword}
                        placeholder="Tìm kiếm"
                        onChange={(e) => setKeyword(e.target.value)}
                        onPressEnter={() => setReload(!reload)}
                    />
                    <Button type="primary" onClick={() => setReload(!reload)}>
                        <Search size={17.5} />
                    </Button>
                </Flex>

                <Button type="primary" icon={<CirclePlus size={16} />} onClick={() => setIsCreateVisible(true)}>
                    Thêm bệnh nhân
                </Button>
            </Flex>

            <Form>
                <Flex gap={10}>
                    <Form.Item label="Sắp xếp" style={{ width: '220px' }} name="sort" valuePropName="sort">
                        <Select
                            style={{ width: 150 }}
                            value={sort}
                            onChange={(value) => setSort(value)}
                            options={sortOptions}
                        />
                    </Form.Item>
                    <Form.Item label="Trạng thái" style={{ width: '220px' }} name="isActive" valuePropName="isActive">
                        <Select
                            style={{ width: 100 }}
                            value={isActive}
                            onChange={(value) => setIsActive(value)}
                            options={[
                                { value: "all", label: "Tất cả" },
                                { value: true, label: "Hoạt động" },
                                { value: false, label: "Khóa" }
                            ]}
                        />
                    </Form.Item>
                </Flex>
            </Form>

            {/* user table */}
            <Table
                rowKey={"id"}
                loading={loading}
                columns={columns}
                dataSource={users}
                pagination={pagination}
                onChange={(e: any) => { handleTableChange(e) }}
                scroll={{ x: 1000, y: 500 }}
            />

            <ModalCreatePatient
                role="patient"
                form={formCreate}
                handleOk={handleCreateOk}
                isVisible={isCreateVisible}
                handleCancel={handleCreateCancel}
            />

            <ModalViewUser
                role="patient"
                form={formView}
                isVisible={isViewVisible}
                handleCancel={handleViewCancel}
            />
        </div>
    );
}

export default AdminPatientDashboard; 