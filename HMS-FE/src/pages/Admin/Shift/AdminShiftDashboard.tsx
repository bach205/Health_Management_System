import { useState } from "react";
import { Table, Space, Flex, Button, Form, Input, Select, notification, Tooltip, Popconfirm, } from "antd";
import { CirclePlus, Search, Trash, UserRoundPen } from "lucide-react";

import dayjs from "dayjs";
import type { IShift } from "../../../types/index.type";
import UserListTitle from "../../../components/ui/UserListTitle";
import { createShift, deleteShift, updateShift } from "../../../services/shift.service";
import ModalCreateShift from "../../../components/modal/ModalCreateShift";
import ModalUpdateShift from "../../../components/modal/ModalUpdateShift";
import { useShiftList } from "../../../hooks/useShiftList";
  
const AdminShiftDashboard = () => {
  const [isCreateVisible, setIsCreateVisible] = useState<boolean>(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState<boolean>(false);
  const [currentShift, setCurrentShift] = useState<IShift>({} as IShift);

  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

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
      title: "Tên ca",
      dataIndex: "name",
      key: "name",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Giờ bắt đầu",
      dataIndex: "start_time",
      width: 170,
      key: "start_time",
      render: (time: string) => dayjs(time).format("HH:mm"),
    },
    {
      title: "Giờ kết thúc",
      dataIndex: "end_time",
      width: 170,
      key: "end_time",
      render: (time: string) => dayjs(time).format("HH:mm"),
    },

    // action
    {
      title: "Hành động",
      fixed: "right",
      align: "center",
      width: 170,
      ellipsis: true,
      key: "action",
      render: (_: any, record: IShift) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              type="text"
              onClick={() => handleEdit(record)}
              icon={<UserRoundPen size={17.5} />}
            ></Button>
          </Tooltip>

          <Tooltip title="Xóa ca">

            <Popconfirm
              title="Bạn chắc chắn muốn xóa ca này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="text" icon={<Trash size={17.5} />}></Button>
            </Popconfirm>
          </Tooltip>

        </Space>
      ),
    },
  ];

  const handleDelete = async (id: number) => {
    try {
      await deleteShift(id);
      notification.success({ message: "Xóa ca thành công" });
      setReload(!reload);
    } catch (error: any) {
      console.log(error);
      if (error?.response?.data) {
        notification.error({ message: error.response.data.message });
      } else if (error?.errorFields?.length > 0) {
        notification.error({ message: error.errorFields[0].errors[0] });
      } else {
        notification.error({ message: error.message });
      }
    }
  }


  const handleEdit = async (record: IShift) => {
    try {
      setCurrentShift(record);
      formUpdate.setFieldsValue({
        ...record,
        start_time: record.start_time ? dayjs(record.start_time) : null,
        end_time: record.end_time ? dayjs(record.end_time) : null,
      });
      setIsUpdateVisible(true);
    } catch (error: any) {
      if (error?.response?.data) {
        notification.error({ message: error.response.data.message });
      } else if (error?.errorFields?.length > 0) {
        notification.error({ message: error.errorFields[0].errors[0] });
      } else {
        notification.error({ message: error.message });
      }
    }
  };


  const handleCreateCancel = () => {
    setIsCreateVisible(false);
  };

  const handleUpdateCancel = () => {
    setIsUpdateVisible(false);
  };

  //Submit create doctor
  const handleCreateOk = async () => {
    try {
      const values = await formCreate.validateFields();
      const defaultDate = dayjs('2000-01-01');
      const startTime = defaultDate
        .hour(values.start_time.hour())
        .minute(values.start_time.minute())
        .second(0);
  
      const endTime = defaultDate
        .hour(values.end_time.hour())
        .minute(values.end_time.minute())
        .second(0);
  
      if (startTime.isAfter(endTime)) {
        notification.error({ message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc" });
        return;
      }
      await createShift(values);
      notification.success({ message: "Tạo ca thành công" });
      setReload(!reload);
      setIsCreateVisible(false);
    } catch (error: any) {
      console.log(error)
      if (error?.response?.data?.message) {
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
      const defaultDate = dayjs('2000-01-01');
      const startTime = defaultDate
        .hour(values.start_time.hour())
        .minute(values.start_time.minute())
        .second(0);

      const endTime = defaultDate
        .hour(values.end_time.hour())
        .minute(values.end_time.minute())
        .second(0);

      if (startTime.isAfter(endTime)) {
        notification.error({ message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc" });
        return;
      }
      const updatedShift = {
        ...values,
        // id: currentShift.id,
      };
      await updateShift(updatedShift, currentShift.id);
      setReload(!reload);
      notification.success({ message: "Cập nhật ca thành công" });

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


  // custom hook
  const {
    shifts, loading, keyword, reload, sort, pagination,
    setKeyword, setReload, setSort, handleTableChange,
  } = useShiftList(); 


  return (
    <div>
      <UserListTitle title="ca làm việc" />

      {/* filter bar */}
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
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
          Thêm ca làm việc
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
                options={[{ value: "newest", label: "Mới nhất" }, { value: "oldest", label: "Cũ nhất" }]}
              />
            </Form.Item>
          </Flex>
        </Form>
      </Flex>

      {/* user table */}
      <Table rowKey={"id"}
        loading={loading}
        columns={columns}
        dataSource={shifts}
        pagination={pagination}
        onChange={(e: any) => { handleTableChange(e) }}
        scroll={{ x: 1000, y: 500 }}
      />

      <ModalCreateShift isVisible={isCreateVisible} handleOk={handleCreateOk} handleCancel={handleCreateCancel} form={formCreate}></ModalCreateShift>
      <ModalUpdateShift isVisible={isUpdateVisible} handleOk={handleUpdateOk} handleCancel={handleUpdateCancel} form={formUpdate}></ModalUpdateShift>

    </div>
  );
}

export default AdminShiftDashboard;