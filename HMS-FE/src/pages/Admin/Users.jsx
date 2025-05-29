import {
  DownOutlined,
  EditOutlined,
  FilterOutlined,
  LockOutlined,
  PlusCircleFilled,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  SmileOutlined,
  StopOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Table,
  Typography,
  Tag,
  Space,
  Flex,
  Button,
  Modal,
  Form,
  Input,
  Select,
  notification,
  Tooltip,
  DatePicker,
  Avatar,
  Popconfirm,
  Dropdown,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// import SelectSpecialty from "src/components/SelectSpecialty";
// import Title from "src/components/Title";
import {
  PASSWORD_DEFAULT,
  // Gender,
  // PASSWORD_DEFAULT,
  TYPE_EMPLOYEE,
  TYPE_EMPLOYEE_STR,
  colorOfType,
  // getSourceImage,
} from "../../utils";
import { getUsers } from "../../api/user";
import ModalCreateUser from "./ModalCreateUser";
import ModalUpdateUser from "./ModalUpdateUser";
// import {} from '../../utils'
const { Option } = Select;

const UpDownIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4.5 h-full">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>

  );
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
    icon: <SmileOutlined />,
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

export default function UsersPage() {

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });

  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  // Table column
  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "photo",
      width: 60,
      key: "photo",
      render: (photo) => <Avatar size={32} icon={<UserOutlined />} />,
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
      title: "Ngày sinh",
      width: 170,
      ellipsis: true,
      dataIndex: "birthday",
      key: "birthday",
      render: (birthday) => (
        <Typography.Text>
          {dayjs(birthday).format("DD/MM/YYYY")} -{" "}
          {dayjs().diff(birthday, "year")} tuổi
        </Typography.Text>
      ),
    },
    {
      width: 90,
      ellipsis: true,
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
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
      width: 180,
      title: "Chức vụ",
      key: "userType",
      dataIndex: "userType",
      render: (_, { userType }) => (
        <>
          <Tag color={colorOfType[userType]} key={userType}>
            {TYPE_EMPLOYEE_STR[userType].toUpperCase()}
          </Tag>
        </>
      ),
    },
    {
      width: 150,
      title: "Trạng thái",
      dataIndex: "activeStatus",
      key: "activeStatus",
      render: (_, { activeStatus }) => (
        <>
          <Tag color={activeStatus ? "green" : "red"} key={activeStatus}>
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
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record?.activeStatus ? "Bạn muốn cấm tài khoản ?" : "Bạn muốn hủy cấm tài khoản?"} >
            <Button type="text"
              onClick={() => handleStatus(record)}
              icon={
                record?.activeStatus ? <StopOutlined /> : <StopOutlined style={{ color: 'red' }} />
              }
            ></Button>
          </Tooltip>
          {record?.userType === TYPE_EMPLOYEE.user ? null : (
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                type="text"
                onClick={() => handleEdit(record)}
                icon={<EditOutlined />}
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
              <Button type="text" icon={<ReloadOutlined />}></Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleStatus = async () => {

  };

  const handleEdit = async (record) => {
    try {
      // console.log(record)
      setSelectedUser(record);
      // setIsShowSpecialty(record.userType === TYPE_EMPLOYEE.doctor);
      formUpdate.setFieldsValue({
        ...record,
        birthday: dayjs(record.birthday),
      });
      setIsUpdateVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleOk = () => {

  };

  const handleResetPassword = async (id) => {

  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getUsers({})
        console.log(data)
        setUsers(data?.users);

        setLoading(false);
      } catch (error) {
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

  const handleTableChange = (pagi) => {
    console.log(pagi)
    setPagination({ ...pagi })
  };

  return (
    <div >
      <Typography.Title>
        Quản lý người dùng
      </Typography.Title>

      {/* filter bar */}
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Khôi phục">
            <Button onClick={handleSearch}>
              <ReloadOutlined />
            </Button>
          </Tooltip>
          <Input
            value={keyword}
            placeholder="Tìm kiếm"
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => setReload(!reload)}
          />
          <Button type="primary" onClick={() => setReload(!reload)}>
            <SearchOutlined />
          </Button>
        </Flex>

        <Button type="primary" icon={<PlusCircleFilled />} onClick={() => setIsCreateVisible(true)} >
          Thêm nhân viên
        </Button>
      </Flex>
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Lọc theo">
            <Dropdown placement="bottomLeft" menu={{ items }}>
              <Button type="primary" onClick={() => setReload(!reload)}>
                <a onClick={(e) => e.preventDefault()}>
                  <Space>
                    <UpDownIcon></UpDownIcon>
                  </Space>
                </a>
              </Button>
            </Dropdown>
          </Tooltip>

          <Button type="primary" onClick={() => setReload(!reload)}>
            <SearchOutlined />
          </Button>
        </Flex>
      </Flex>

      {/* user table */}
      <Table rowKey={"_id"}
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1300, y: 500 }}
      />

      {/* Modal */}
      <ModalCreateUser form={formCreate} handleOk={handleCreateOk} isVisible={isCreateVisible} handleCancel={handleCreateCancel}></ModalCreateUser>
      <ModalUpdateUser selectedUser={selectedUser} form={formUpdate} handleOk={handleUpdateOk} isVisible={isUpdateVisible} handleCancel={handleUpdateCancel}></ModalUpdateUser>

    </div>
  );
}
