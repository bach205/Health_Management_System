// AppointmentPage.js
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Radio,
    Select,
    Table,
    Tooltip,
    Typography,
    message,
    notification,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
// import { updateStatusAppointment } from "src/api/appointment";
// import {
//   createMedicine,
//   deleteMedicine,
//   getListMedicine,
//   updateMedicine,
// } from "src/api/medicine";
// import Title from "src/components/Title";
import AddMedicineModal from "./AddMedicineModal";
import Title from "antd/es/typography/Title";
import UserListTitle from "../../../components/ui/UserListTitle";
import { CirclePlus, RefreshCcw, Search } from "lucide-react";
import { sortOptions } from "../../../constants/user.const";
import { useMedicineList } from "../../../hooks/useMedicineList";
// import {
//   FORMAT_DATE_TIME,
//   STATUS_BOOKING,
//   formatPrice,
//   getIdxTable,
// } from "src/utils";
// import { getUsagesTable } from "src/utils/utilJsx";

const MedicineDashboard = () => {
    const [form] = Form.useForm();
    const [showAddModal, setShowAddModal] = useState(false);
    const [isCreate, setIsCreate] = useState(true);
    const [filterDate, setFilterDate] = useState(dayjs());
    // const [keyword, setKeyword] = useState("");
    const [listMedicine, setListMedicine] = useState([]);
    const [listMedicineFilter, setListMedicineFilter] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [reload, setReload] = useState(true);
    // const [pagination, setPagination] = useState({
    //     page: 1,
    //     pageSize: 10,
    // });

    const handleResearch = () => {
        setKeyword("");
        setReload(!reload);
    };


    //   // useEffect(() => {
    //   //   if (showAddModal) {
    //   //     handleSearchModal();
    //   //   }
    //   // }, [handleSearchModal, showAddModal]);

    //   const handleEnterExamination = async (record) => {
    //     try {
    //       const result = await updateStatusAppointment({
    //         appointmentId: record._id,
    //         status: STATUS_BOOKING.waiting,
    //       });

    //       notification.success({
    //         message: `Bệnh nhân ${record.patientId.fullName} đã vào phòng chờ khám`,
    //       });
    //       setReload(!reload);
    //     } catch (error) {
    //       console.error("Error: ", error);
    //     }
    //   };

    const handleShowEdit = (record: any) => {
        form.setFieldsValue({
            ...record,
        });
        setIsCreate(false);
        setShowAddModal(true);
    };

    const handleDelete = async (record: any) => {
        try {
            //   await deleteMedicine(record._id);
            message.success("Xóa thành công");
            setReload(!reload);
        } catch (error) {
            message.error("Xóa thất bại");
        }
    };

    const columns: any = [
        {
            title: "#",
            dataIndex: "index",
            key: "index",
            align: "center",
            width: 50,
            render: (_: any, __: any, index: number) => (
                index
                // <Typography.Text>{getIdxTable(index, pagination.page)}</Typography.Text>
            ),
        },
        {
            width: 200,
            title: "Tên thuốc",
            dataIndex: "name",
            key: "name",
        },
        {
            width: 100,
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
        },
        {
            width: 100,
            title: "Giá tiền",
            dataIndex: "price",
            key: "price",
            align: "right",
            //   render: function (text) {
            //     return formatPrice(text);
            //   },
        },
        {
            width: 100,
            title: "Cách dùng",
            dataIndex: "usage",
            key: "usage",
            align: "center",
            //   render: (text) => getUsagesTable(text),
        },
        {
            width: 200,
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
            render: (text: string) => (
                <Tooltip title={text}>
                    <Typography.Paragraph ellipsis={{ rows: 2 }}>
                        {text}
                    </Typography.Paragraph>
                </Tooltip>
            ),
        },
        {
            width: 200,
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (text: string) => (
                <Tooltip title={text}>
                    <Typography.Paragraph ellipsis={{ rows: 3 }}>
                        {text}
                    </Typography.Paragraph>
                </Tooltip>
            ),
        },
        {
            width: 160,
            title: "Ngày cập nhật",
            dataIndex: "updatedAt",
            key: "updatedAt",
            align: "center",
            //   render: (text) => dayjs(text).format(FORMAT_DATE_TIME),
        },
        {
            width: 100,
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            align: "center",
            render: (text: string, record: any) => (
                <Flex gap={10}>
                    <Tooltip title="Sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleShowEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa?"
                        okText="Xác nhận"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Tooltip title="Xóa">
                            <Button type="primary" icon={<DeleteOutlined />} danger ghost />
                        </Tooltip>
                    </Popconfirm>
                </Flex>
            ),
        },
    ];

    //   useEffect(() => {
    //     const initData = async () => {
    //       setInitLoading(true);
    //       // Replace this with the actual API call to fetch appointments
    //       const { medicines } = await getListMedicine({ searchKey: keyword });
    //       setInitLoading(false);
    //       setListMedicine(medicines);
    //     };
    //     initData();
    //   }, [filterDate, reload]);

    //   const handleOk = () => {
    //     form
    //       .validateFields()
    //       .then(async (values) => {
    //         console.log(values);
    //         const data = {
    //           ...values,
    //         };

    //         if (isCreate) {
    //           await createMedicine(data);
    //           notification.success({
    //             message: "Thêm thuốc thành công",
    //           });
    //         } else {
    //           await updateMedicine(data);
    //           notification.success({
    //             message: "Cập nhật thuốc thành công",
    //           });
    //         }
    //         form.resetFields();
    //         handleCancel();
    //         setReload(!reload);
    //       })
    //       .catch((error) => {
    //         message.error(error);
    //         console.error("Error: ", error);
    //       });
    //   };

    //   const handleCancel = () => {
    //     setShowAddModal(false);
    //     setIsCreate(true);
    //   };

    //   const handleSearch = (newValue) => {
    //     setKeyword(newValue);
    //   };
    const handleResetFilter = () => {
        setKeyword("");
        setSort("newest");
        setIsActive("all");
        setReload(!reload);
    }

    const {
        medicines, loading, keyword, reload, sort, pagination, isActive,
        setKeyword, setReload, setSort, setIsActive, handleTableChange,
    } = useMedicineList();

    return (
        <div>
            <UserListTitle title="thuốc" />

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

                <Button type="primary" icon={<CirclePlus size={16} />} onClick={() => setShowAddModal(true)} >
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
                                options={sortOptions}
                            />
                        </Form.Item>
                        <Form.Item label="Trạng thái" style={{ width: '220px' }} name="isActive" valuePropName="isActive" >
                            <Select
                                style={{ width: 100 }}
                                value={isActive}
                                onChange={(value) => setIsActive(value)}
                                options={[{ value: "all", label: "Tất cả" }, { value: true, label: "Hoạt động" }, { value: false, label: "Khóa" }]}
                            />
                        </Form.Item>
                    </Flex>
                </Form>
            </Flex>

            <Table
                rowKey={"_id"}
                className="demo-loadmore-list"
                loading={loading}
                columns={columns}
                dataSource={listMedicine}
            />
            <AddMedicineModal setShowAddModal={setShowAddModal} showAddModal={showAddModal}></AddMedicineModal>
        </div>
    );
};

export default MedicineDashboard;
