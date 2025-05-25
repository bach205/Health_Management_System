import { useEffect, useState } from "react";
import { Breadcrumb, Table, Typography, Tag, Space, Flex, Button, Modal, Form, Input, Select, notification, Tooltip, DatePicker, Avatar, Popconfirm, Dropdown, } from "antd";
import { ArrowUpDown, Ban, CirclePlus, RefreshCcw, RotateCcw, Search, User, UserRoundPen } from "lucide-react";
import { colorOfType, PASSWORD_DEFAULT, TYPE_EMPLOYEE, TYPE_EMPLOYEE_STR, type EmployeeType, type IDoctor } from "../../utils";
import { getDoctors } from "../../api/doctor";
import ModalCreateUser from "./ModalCreateUser";
import ModalUpdateUser from "./ModalUpdateUser";

interface IPagination {
  total: number;
  pageSize: number;
  current: number;

}
const items = [
  {
    key: '1',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
        1st menu item
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
        2nd menu item (disabled)
      </a>
    ),
    disabled: true,
  },
  {
    key: '3',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
        3rd menu item (disabled)
      </a>
    ),
    disabled: true,
  },
  {
    key: '4',
    danger: true,
    label: 'a danger item',
  },
];
const AdminDashboard = () => {
  const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState<boolean>(false);

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const [selectedUser, setSelectedUser] = useState<IDoctor>({} as IDoctor);
  const [users, setUsers] = useState<IDoctor[]>([]);

  const [reload, setReload] = useState<boolean>(false);

  const [pagination, setPagination] = useState<IPagination>({
    total: 0,
    pageSize: 10,
    current: 1,
  });

  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  // Table column
  const columns: any = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      // dataIndex: "photo",
      width: 60,
      // key: "photo",
      render: (photo: any) => <Avatar size={32} icon={<User />} />,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      width: 170,
      key: "fullName",
    },
    {
      width: 90,
      ellipsis: true,
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender: 'male' | 'female') => {
        return gender === 'male' ? 'Nam' : 'Nữ';
      },
    },
    {
      width: 120,
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      width: 150,
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      width: 150,
      title: "Trạng thái",
      dataIndex: "activeStatus",
      key: "activeStatus",
      render: (_: any, { activeStatus }: IDoctor) => (
        <>
          <Tag color={activeStatus ? "green" : "red"}>
            {activeStatus ? "Đang hoạt động" : "Đã khóa"}
          </Tag>
        </>
      ),
    },
    // action
    {
      title: "Hành động",
      fixed: "right",
      align: "center",
      width: 150,
      ellipsis: true,
      key: "action",
      render: (_: any, record: IDoctor) => (
        <Space size="small">
          <Tooltip title={record?.activeStatus ? "Bạn muốn cấm tài khoản ?" : "Bạn muốn hủy cấm tài khoản?"} >
            <Button type="text"
              onClick={() => handleStatus(record)}
              icon={
                record?.activeStatus ? <Ban size={17.5} /> : <Ban size={17.5} style={{ color: 'red' }} />
              }
            ></Button>
          </Tooltip>
          {record?.userType === TYPE_EMPLOYEE.user ? null : (
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                type="text"
                onClick={() => handleEdit(record)}
                icon={<UserRoundPen size={17.5} />}
              ></Button>
            </Tooltip>
          )}

          <Popconfirm
            title="Khôi phục mật khẩu"
            description={"Mật khẩu sẽ được khôi phục về mặc định là " + PASSWORD_DEFAULT}
            onConfirm={() => handleResetPassword(record._id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Khôi phục mật khẩu mặc định" placement="topRight">
              <Button type="text" icon={<RotateCcw size={17.5} />}></Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleStatus = async (record: IDoctor) => {

  };

  const handleEdit = async (record: IDoctor) => {
    console.log(record)
    try {
      // console.log(record)
      setSelectedUser(record);
      // setIsShowSpecialty(record.userType === TYPE_EMPLOYEE.doctor);
      formUpdate.setFieldsValue({
        ...record,
        // birthday: dayjs(record.birthday),
      });
      setIsUpdateVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleOk = () => {

  };

  const handleResetPassword = async (id: string) => {

  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDoctors({})
        console.log(data)
        setUsers(data?.users);

        setLoading(false);
      } catch (error) {
        console.log(error)
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateCancel = () => {
    setIsCreateVisible(false);
  };

  const handleUpdateCancel = () => {
    setIsUpdateVisible(false);
  };

  const handleCreateOk = async () => {
    try {
      const values = await formCreate.validateFields();
      // gọi API thêm
      console.log("Create:", values);
      setIsCreateVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateOk = async () => {
    try {
      const values = await formUpdate.validateFields();
      // gọi API cập nhật
      console.log("Update:", values);
      setIsUpdateVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {

  };

  const handleTableChange = (e: any) => {
    console.log(e)
    // console.log(e.pagi)
    setPagination({ ...e.pagi })
  };

  return (
    <div>
      <Typography.Title>
        Quản lý người dùng
      </Typography.Title>

      {/* filter bar */}
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Khôi phục">
            <Button onClick={handleSearch}>
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

        <Button type="primary" icon={<CirclePlus height={15} />} onClick={() => setIsCreateVisible(true)} >
          Thêm nhân viên
        </Button>
      </Flex>
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Lọc theo">
            <Dropdown placement="bottomLeft" menu={{ items }}>
              <Button type="primary" onClick={() => setReload(!reload)}>
                <Space>
                  <ArrowUpDown size={17.5} style={{ height: '20px' }}></ArrowUpDown>
                </Space>
              </Button>
            </Dropdown>
          </Tooltip>

          <Button type="primary" onClick={() => setReload(!reload)}>
            <Search size={17.5} />
          </Button>
        </Flex>
      </Flex>

      {/* user table */}
      <Table rowKey={"_id"}
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={pagination}
        onChange={(e: any) => { handleTableChange(e) }}
        scroll={{ x: 1300, y: 500 }}
      />
      <ModalCreateUser form={formCreate} handleOk={handleCreateOk} isVisible={isCreateVisible} handleCancel={handleCreateCancel}></ModalCreateUser>
      <ModalUpdateUser form={formUpdate} handleOk={handleUpdateOk} isVisible={isUpdateVisible} handleCancel={handleUpdateCancel}></ModalUpdateUser>

    </div>
  );
}

export default AdminDashboard;