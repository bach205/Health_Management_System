import { useState } from "react";
import { Table, Tag, Space, Flex, Button, Form, Input, Select, notification, Tooltip, Popconfirm, } from "antd";
import { Ban, CirclePlus, Eye, RefreshCcw, RotateCcw, Search, UserRoundPen } from "lucide-react";

import ModalCreateUser from "../../../components/modal/ModalCreateUser";
import ModalUpdateUser from "../../../components/modal/ModalUpdateUser";
import dayjs from "dayjs";
import { useDoctorList } from "../../../hooks/useDoctorList";
import ModalViewUser from "../../../components/modal/ModalViewUser";
import { specialtyOptions, TYPE_EMPLOYEE_STR, PASSWORD_DEFAULT } from "../../../constants/user.const";
import type { IDoctor } from "../../../types/index.type";
import UserListTitle from "../../../components/ui/UserListTitle";

const AdminDoctorDashboard = () => {
  const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState<boolean>(false);
  const [isViewVisible, setIsViewVisible] = useState<boolean>(false);

  const filterOptions = [{ value: "all", label: "Tất cả" }, ...specialtyOptions]

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
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
      width: 100,
      title: "Khoa",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      width: 150,
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (_: any, { is_active }: IDoctor) => (
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
      width: 160,
      ellipsis: true,
      key: "action",
      render: (_: any, record: IDoctor) => (
        <Space size="small">
          <Tooltip title="Xem thông tin">
            <Button
              type="text"
              onClick={() => handleView(record)}
              icon={<Eye size={17.5} />}
            ></Button>
          </Tooltip>
          {record?.role === TYPE_EMPLOYEE_STR.patient ? null : (
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
            onConfirm={() => handleResetPassword(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Khôi phục mật khẩu mặc định" placement="topRight">
              <Button type="text" icon={<RotateCcw size={17.5} />}></Button>
            </Tooltip>
          </Popconfirm>
          <Tooltip title={record?.is_active ? "Bạn muốn cấm tài khoản ?" : "Bạn muốn hủy cấm tài khoản?"} >
            <Popconfirm
              title={record?.is_active ? "Cấm tài khoản?" : "Bỏ cấm tài khoản?"}
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
          </Tooltip>
        </Space>
      ),
    },
  ];

  // is active
  const handleStatus = async (record: IDoctor) => {
    console.log(record)
  };

  const handleView = async (record: IDoctor) => {
    // console.log(record)
    try {
      // setIsShowSpecialty(record.role === TYPE_EMPLOYEE.doctor);
      formView.setFieldsValue({
        ...record,
        date_of_birth: dayjs(record.date_of_birth),
      });
      setIsViewVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };
  const handleEdit = async (record: IDoctor) => {
    // console.log(record)
    try {
      // setIsShowSpecialty(record.role === TYPE_EMPLOYEE.doctor);
      formUpdate.setFieldsValue({
        ...record,
        date_of_birth: dayjs(record.date_of_birth),
      });
      setIsUpdateVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleResetPassword = (id: string) => {
    console.log(id)
  }


  const handleCreateCancel = () => {
    setIsCreateVisible(false);
  };

  const handleUpdateCancel = () => {
    setIsUpdateVisible(false);
  };
  const handleViewCancel = () => {
    setIsViewVisible(false);
  };


  //Submit create doctor
  const handleCreateOk = async () => {
    try {
      const values = await formCreate.validateFields();
      // gọi API thêm
      console.log("Create:", values);
      notification.success({ message: "Tạo tài khoản thành công" });

      setIsCreateVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  //Submit update doctor
  const handleUpdateOk = async () => {
    try {
      const values = await formUpdate.validateFields();
      // gọi API cập nhật
      console.log("Update:", values);
      notification.success({ message: "Cập nhật tài khoản thành công" });

      setIsUpdateVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  // custom hook
  const {
    users, loading, keyword, reload, specialty, sort, pagination,
    setKeyword, setReload, setSpecialty, setSort, handleTableChange,
  } = useDoctorList();


  return (
    <div>
      <UserListTitle title="bác sĩ" />


      {/* filter bar */}
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Hủy lọc">
            <Button onClick={() => setReload(!reload)}>
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

        <Button type="primary" icon={<CirclePlus size={16} />} onClick={() => setIsCreateVisible(true)} >
          Thêm bác sĩ
        </Button>
      </Flex>
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Form>
          <Flex gap={10}>
            <Form.Item label="Lọc theo khoa" style={{ width: '220px' }} name="specialty" valuePropName="specialty" >
              <Select
                style={{ width: 120 }}
                value={specialty}
                onChange={(value) => setSpecialty(value)}
                options={filterOptions}
              />
            </Form.Item>
            <Form.Item label="Sắp xếp" style={{ width: '220px' }} name="sort" valuePropName="sort" >
              <Select
                style={{ width: 120 }}
                value={sort}
                onChange={(value) => setSort(value)}
                options={[
                  { value: "stt", label: "STT" },
                  { value: "name_asc", label: "Tên A-Z" },
                  { value: "name_desc", label: "Tên Z-A" },
                  { value: "created_at_desc", label: "Mới nhất" },
                  { value: "created_at_asc", label: "Cũ nhất" },
                ]}
              />
            </Form.Item>
          </Flex>
        </Form>
      </Flex>

      {/* user table */}
      <Table rowKey={"id"}
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={pagination}
        onChange={(e: any) => { handleTableChange(e) }}
        scroll={{ x: 1000, y: 500 }}
      />

      <ModalCreateUser role="doctor" form={formCreate} handleOk={handleCreateOk} isVisible={isCreateVisible} handleCancel={handleCreateCancel}></ModalCreateUser>
      <ModalUpdateUser role="doctor" form={formUpdate} handleOk={handleUpdateOk} isVisible={isUpdateVisible} handleCancel={handleUpdateCancel}></ModalUpdateUser>
      <ModalViewUser role="doctor" form={formView} isVisible={isViewVisible} handleCancel={handleViewCancel}></ModalViewUser>

    </div>
  );
}

export default AdminDoctorDashboard;