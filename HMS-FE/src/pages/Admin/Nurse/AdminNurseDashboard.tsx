import { useState, useEffect } from "react";
import { Table, Tag, Space, Flex, Button, Form, Input, Select, notification, Tooltip, Popconfirm } from "antd";
import { Ban, CirclePlus, Eye, RefreshCcw, RotateCcw, Search, Trash, UserRoundPen } from "lucide-react";
import { specialtyOptions, TYPE_EMPLOYEE_STR, PASSWORD_DEFAULT } from "../../../constants/user.const";
import ModalCreateUser from "../../../components/modal/ModalCreateUser";
import ModalUpdateUser from "../../../components/modal/ModalUpdateUser";
import dayjs from "dayjs";
import ModalViewUser from "../../../components/modal/ModalViewUser";
import { useNurseList } from "../../../hooks/useNurseList";
import UserListTitle from "../../../components/ui/UserListTitle";
import type { IUserBase } from "../../../types/index.type";
import { createNurse, updateNurse, banNurse, resetPassword, deleteNurse } from "../../../api/nurse.ts";
import { getShiftService } from "../../../services/shift.service.ts";
import { updatePassword } from "../../../services/doctor.service.ts";

const AdminNurseDashboard = () => {
  const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState<boolean>(false);
  const [isViewVisible, setIsViewVisible] = useState<boolean>(false);
  const [shifts, setShifts] = useState<any[]>([]);

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const [formView] = Form.useForm();
  const [curNurseId, setCurNurseId] = useState(0);

  // Fetch shifts on component mount
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await getShiftService();
        setShifts(response.data.data);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };
    fetchShifts();
  }, []);

  // Table column
  const columns: any = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 50,
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
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (_: any, { is_active }: IUserBase) => (
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
      render: (_: any, record: IUserBase) => (
        <Space size="small">
          <Tooltip title="Xem thông tin">
            <Button
              type="text"
              onClick={() => handleView(record)}
              icon={<Eye size={16} />}
            ></Button>
          </Tooltip>
          {record?.role === TYPE_EMPLOYEE_STR.patient ? null : (
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                type="text"
                onClick={() => { handleEdit(record) }}
                icon={<UserRoundPen size={16} />}
              ></Button>
            </Tooltip>
          )}

          <Popconfirm
            title="Khôi phục mật khẩu"
            description={"Mật khẩu sẽ được gửi về email của tài khoản này"}
            onConfirm={() => handleResetPassword(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Tooltip title="Khôi phục mật khẩu mặc định" placement="topRight">
              <Button type="text" icon={<RotateCcw size={16} />}></Button>
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
                icon={<Ban size={16} style={{ color: record?.is_active ? undefined : 'red' }} />}
              />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Xóa tài khoản">
            <Popconfirm
              title="Xóa tài khoản?"
              description="Bạn chắc chắn muốn xóa tài khoản này?"
              onConfirm={() => handleDeleteNurse(record.id.toString())}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="text" danger
                icon={<Trash size={16} />}>
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];


  const handleView = async (record: IUserBase) => {
    // console.log(record)
    try {
      // setIsShowSpecialty(record.role === TYPE_EMPLOYEE.doctor);
      formView.setFieldsValue({
        ...record,
        date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
      });
      setIsViewVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };
  // is active
  const handleStatus = async (record: IUserBase) => {
    try {
      const result = await banNurse(record?.id);
      if (result.status >= 200 && result.status < 300) {
        notification.success({
          message: record.is_active ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công"
        });
        setReload(!reload);
      } else if (result.status >= 400) {
        notification.error({ message: result.data.message });
      }
    } catch (error: any) {
      console.log(error);
      notification.error({
        message: error.response?.data?.message || "Có lỗi xảy ra khi thực hiện thao tác"
      });
    }
  };

  const handleEdit = async (record: IUserBase) => {
    try {
      // setIsShowSpecialty(record.role === TYPE_EMPLOYEE.doctor);
      formUpdate.setFieldsValue({
        ...record,
        date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
      });
      setCurNurseId(record.id);
      setIsUpdateVisible(true);
    } catch (error) {
      console.log(error);
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleResetPassword = async (id: number) => {
    // try {
    //   const result = await resetPassword(id);
    //   if (result.status >= 200 && result.status < 300) {
    //     notification.success({ message: result.data.message });
    //   } else if (result.status >= 400) {
    //     notification.error({ message: result.data.message });
    //   }
    // } catch (error: any) {
    //   console.log(error);
    //   notification.error({ message: error.response?.data?.message || "Có lỗi xảy ra" });
    // }
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

  };

  const handleCreateCancel = () => {
    setIsCreateVisible(false);
  };

  const handleUpdateCancel = () => {
    setCurNurseId(0);
    setIsUpdateVisible(false);
  };

  const handleViewCancel = () => {
    setIsViewVisible(false);
  }
  //Submit create nurse
  const handleCreateOk = async () => {
    try {
      const values = await formCreate.validateFields();
      if (!values.create_password) {
        values.password = undefined;
      }
      const result = await createNurse(values);
      if (result.status >= 200 && result.status < 300) {
        notification.success({ message: result.data.message });
        setReload(!reload);
      } else if (result.status >= 400) {
        notification.error({ message: result.data.message });
      }
    } catch (error: any) {
      console.log(error);
      notification.error({ message: error.response.data.message });
    } finally {
      setIsCreateVisible(false);
    }
  };

  //Submit update nurse
  const handleUpdateOk = async () => {
    try {
      const values = await formUpdate.validateFields();
      console.log(values);
      const result = await updateNurse(curNurseId, values);
      if (result.status >= 200 && result.status < 300) {
        notification.success({ message: result.data.message });
        setReload(!reload);
      } else if (result.status >= 400) {
        notification.error({ message: result.data.message });
      }
    } catch (error: any) {
      console.log(error);
      notification.error({ message: error.response.data.message });
    } finally {
      setIsUpdateVisible(false);
      setCurNurseId(0);
    }
  };

  // custom hook
  const {
    users, loading, keyword, reload, pagination, sort, shift,
    setKeyword, setReload, setSort, setShift, handleTableChange,
  } = useNurseList();

  const handleAbortFilter = () => {
    setReload(!reload);
    setSort("name_asc");
    setShift("all");
    setKeyword("");
  }

  const handleDeleteNurse = async (id: string) => {
    try {
      const result = await deleteNurse(id);
      if (result.status >= 200 && result.status < 300) {
        notification.success({ message: 'Xóa tài khoản thành công' });
        setReload(!reload);
      } else {
        notification.error({ message: result.data.message });
      }
    } catch (error: any) {
      notification.error({ message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản' });
    }
  };

  return (
    <div>
      <UserListTitle title="y tá" />

      {/* filter bar */}
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Hủy lọc">
            <Button onClick={() => handleAbortFilter()}>
              <RefreshCcw size={17.5} />
            </Button>
          </Tooltip>
          <Input
            value={keyword}
            placeholder="Tìm kiếm theo tên"
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => setReload(!reload)}
          />
          <Button type="primary" onClick={() => setReload(!reload)}>
            <Search size={17.5} />
          </Button>
        </Flex>

        <Button type="primary" icon={<CirclePlus size={16} />} onClick={() => setIsCreateVisible(true)} >
          Thêm y tá
        </Button>
      </Flex>
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Form>
          <Flex gap={10}>
            <Form.Item label="Ca làm việc" style={{ width: '220px' }} name="shift" valuePropName="shift" >
              <Select
                style={{ width: 120 }}
                value={shift}
                onChange={(value) => setShift(value)}
                options={[
                  { value: "all", label: "Tất cả" },
                  ...shifts.map(shift => ({
                    value: String(shift.id),
                    label: shift.name
                  }))
                ]}
              />
            </Form.Item>
            <Form.Item label="Sắp xếp" style={{ width: '220px' }} name="sort" valuePropName="sort" >
              <Select
                style={{ width: 120 }}
                value={sort}
                onChange={(value) => setSort(value)}
                options={[
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

      <ModalCreateUser role="nurse" form={formCreate} handleOk={handleCreateOk} isVisible={isCreateVisible} handleCancel={handleCreateCancel}></ModalCreateUser>
      <ModalUpdateUser role="nurse" form={formUpdate} handleOk={handleUpdateOk} isVisible={isUpdateVisible} handleCancel={handleUpdateCancel}></ModalUpdateUser>
      <ModalViewUser role="nurse" form={formView} isVisible={isViewVisible} handleCancel={handleViewCancel}></ModalViewUser>
    </div>
  );
}

export default AdminNurseDashboard;