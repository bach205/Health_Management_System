import { useState } from "react";
import { Table, Tag, Space, Flex, Button, Form, Input, Select, notification, Tooltip, Popconfirm, Avatar, } from "antd";
import { Ban, CirclePlus, Eye, RefreshCcw, RotateCcw, Search, User, UserRoundPen } from "lucide-react";

import dayjs from "dayjs";
import { useDoctorList } from "../../../hooks/useDoctorList";
import ModalViewUser from "../../../components/modal/ModalViewUser";
import { specialtyOptions, TYPE_EMPLOYEE_STR, sortOptions } from "../../../constants/user.const";
import type { IDoctor } from "../../../types/index.type";
import UserListTitle from "../../../components/ui/UserListTitle";
import { createDoctor, updateDoctor, updatePassword, updateStatus } from "../../../services/doctor.service";
import ModalCreateDoctor from "../../../components/modal/Doctor/ModalCreateDoctor";
import ModalUpdateDoctor from "../../../components/modal/Doctor/ModalUpdateDoctor";
import { useSpecialtyList } from "../../../hooks/useSpecialtyList";
import ImportCSV from "../../../components/doctor/ImportCSV";

const AdminDoctorDashboard = () => {
  const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState<boolean>(false);
  const [isViewVisible, setIsViewVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<IDoctor | null>(null);
  const filterOptions = [{ value: "all", label: "Tất cả" }, ...specialtyOptions]
  // console.log("currentUser", currentUser)
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
      title: "Ảnh",
      dataIndex: "avatar",
      key: "avatar",
      width: 60,
      align: "center" as const,
      render: (avatar: string) => {
        return avatar ? <Avatar src={avatar} /> : <Avatar icon={<User size={17.5} />} />
      },
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
      width: 120,
      title: "Khoa",
      dataIndex: "doctor",
      key: "doctor",
      render: (record: any) => {
        return record && record.specialty ? record.specialty.name : 'Không có';
      },
    },
    {
      width: 120,
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
      width: 170,
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
            description={"Mật khẩu sẽ được khôi phục và được gửi về email"}
            onConfirm={() => handleResetPassword(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Khôi phục mật khẩu" placement="topRight">
              <Button type="text" icon={<RotateCcw size={17.5} />}></Button>
            </Tooltip>
          </Popconfirm>
          <Tooltip title={record?.is_active ? "Bạn muốn khóa tài khoản ?" : "Bạn muốn mở khóa tài khoản?"} >
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
          </Tooltip>
        </Space>
      ),
    },
  ];

  // is active
  const handleStatus = async (record: IDoctor) => {
    try {
      const res = await updateStatus(record.id, !record.is_active);
      console.log(res)
      notification.success({
        message: record.is_active ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công"
      });
      setReload(!reload);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleView = async (record: IDoctor) => {
    try {
      setCurrentUser(record);
      formView.setFieldsValue({
        ...record,
        date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
        specialty_id: record.doctor?.specialty?.id,
        price: record.doctor?.price || 0,
        bio: record.doctor?.bio
      });
      setIsViewVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleEdit = async (record: IDoctor) => {
    try {
      // if (!record.date_of_birth) {
      //   record.date_of_birth = dayjs().subtract(18, "year").toString();
      // }
      console.log(record)
      setCurrentUser(record);
      formUpdate.setFieldsValue({
        ...record,
        date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
        bio: record.doctor?.bio,
        price: record.doctor?.price || 0,
        specialty_id: record.doctor?.specialty?.id,
      });
      setIsUpdateVisible(true);
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
    formCreate.resetFields();
  };

  const handleUpdateCancel = () => {
    setIsUpdateVisible(false);
    formUpdate.resetFields();
  };
  const handleViewCancel = () => {
    setIsViewVisible(false);
    formView.resetFields();
  };


  //Submit create doctor
  const handleCreateOk = async () => {
    try {
      // const values = await formCreate.validateFields();
      const values = await formCreate.validateFields();
      const createValue = {
        ...values,
        full_name: values.full_name?.trim(),
        email: values.email?.trim(),
        price: values.price || 0,
        phone: values.phone?.trim(),
        bio: values.bio?.trim(),
        specialty_id: values.specialty_id || null,
        address: values.address?.trim(),
        password: values.password || "",
      }
      delete createValue.create_password;
      delete createValue.confirm_password;
      await createDoctor(createValue);
      notification.success({ message: "Tạo tài khoản thành công" });
      formCreate.resetFields();
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

  //Submit update doctor
  const handleUpdateOk = async () => {
    try {
      const values = await formUpdate.validateFields();
      // console.log("values", values)
      if (!currentUser?.id) {
        notification.error({ message: "Không tìm thấy thông tin bác sĩ" });
        return;
      }
      // gọi API cập nhật



      const updatedDoctor = {
        ...values,
        id: currentUser.id,
        full_name: values.full_name?.trim(),
        email: values.email?.trim(),
        specialty_id: values.specialty_id || null,
        phone: values.phone?.trim(),
        bio: values.bio?.trim(),
        address: values.address?.trim(),
      };

      if (values.avatar) {
        updatedDoctor.avatar = values.avatar;
      }

      await updateDoctor(updatedDoctor);
      setReload(!reload);
      notification.success({ message: "Cập nhật tài khoản thành công" });
      formUpdate.resetFields();

      setIsUpdateVisible(false);
    } catch (error: any) {
      console.log(error);
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
    setSpecialty([]);
    setSort("newest");
    setIsActive("all");
    setReload(!reload);
  }



  // custom hook
  const {
    users, loading, keyword, reload, specialty, sort, pagination, isActive,
    setKeyword, setReload, setSpecialty, setSort, setIsActive, handleTableChange,
  } = useDoctorList();

  const { specialties, loading: specialtyLoading, reload: specialtyReload, handleTableChange: specialtyTableChange } = useSpecialtyList(undefined, true);
  return (
    <div>
      <UserListTitle title="bác sĩ" />

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

        <Space>
          <ImportCSV role="doctor" reload={reload} setReload={setReload}></ImportCSV>
          <Button type="primary" icon={<CirclePlus size={16} />} onClick={() => setIsCreateVisible(true)} >
            Thêm bác sĩ
          </Button>
        </Space>
      </Flex>
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Form>
          <Flex gap={10}>
            <Form.Item label="Lọc theo khoa" style={{ width: '350px' }} name="specialty" valuePropName="specialty" >
              <Select
                mode="multiple"
                defaultValue={['']}
                placeholder="Chọn chuyên khoa"
                value={specialty.length > 0 ? specialty : []}
                onChange={(value: string[]) => {

                  setSpecialty(value);
                }}
                className="min-w-[200px]"
                options={[
                  ...specialties
                    .filter((opt) => opt.name !== "")
                    .map((opt) => ({
                      label: opt.name,
                      value: opt.name,
                    })),
                  {
                    label: "Không có",
                    value: "none",
                  }
                ]}
              />
            </Form.Item>
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

      {/* user table */}
      <Table rowKey={"id"}
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={{
          ...pagination,
          showSizeChanger: false
        }}
        onChange={(e: any) => { handleTableChange(e) }}
        scroll={{ x: 1000, y: 500 }}
      />

      <ModalCreateDoctor role="doctor" form={formCreate} handleOk={handleCreateOk} isVisible={isCreateVisible} handleCancel={handleCreateCancel}></ModalCreateDoctor>
      <ModalUpdateDoctor reload={reload} setReload={setReload} user={currentUser} role="doctor" form={formUpdate} handleOk={handleUpdateOk} isVisible={isUpdateVisible} handleCancel={handleUpdateCancel}></ModalUpdateDoctor>
      <ModalViewUser role="doctor" form={formView} isVisible={isViewVisible} handleCancel={handleViewCancel} user={currentUser}></ModalViewUser>

    </div>
  );
}

export default AdminDoctorDashboard;