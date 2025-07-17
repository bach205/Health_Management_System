import { useEffect, useState } from "react";
import { Table, Flex, Button, Input, Select, Tooltip, notification, Form, Popconfirm } from "antd";
import { RefreshCcw, Search, CirclePlus, Eye, UserRoundPen, Pen, Trash2, Pencil } from "lucide-react";
import { useSpecialtyList } from "../../../hooks/useSpecialtyList";
import { sortOptions } from "../../../constants/user.const";
import type { ISpecialty } from "../../../types/index.type";
import UserListTitle from "../../../components/ui/UserListTitle";
import { deleteMedicine } from "../../../services/medicine.service";
import { deleteSpecialty } from "../../../services/specialty.service";
import ModalCreateSpecialty from "../../../components/modal/Specialty/ModalCreateSpecialty";
import ModalUpdateSpecialty from "../../../components/modal/Specialty/ModalUpdateSpecialty";
import ModalViewSpecialty from "../../../components/modal/Specialty/ModalViewSpecialty";

const AdminSpecialtyDashboard = () => {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  const [isViewVisible, setIsViewVisible] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState<ISpecialty | null>(null);
  const [formCreate] = Form.useForm();
  const [formUpdate] = Form.useForm();

  const {
    specialties,
    loading,
    keyword,
    reload,
    sort,
    pagination,
    setKeyword,
    setReload,
    setSort,
    setPagination,
    handleTableChange,
  } = useSpecialtyList();

  const handleResetFilter = () => {
    setKeyword("");
    setSort("name_asc");
    setReload(!reload);
  };

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
      title: "Tên chuyên khoa",
      dataIndex: "name",
      key: "name",
      width: 300,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 150,
      render: (_: any, record: ISpecialty) => (
        <Flex gap={10} justify="center">
          <Tooltip title="Xem">
            <Button
              type="text"
              icon={<Eye size={17.5} />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
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
        </Flex>
      ),
    },
  ];


  const handleEdit = (record: ISpecialty) => {
    setCurrentSpecialty(record);
    setIsUpdateVisible(true);
    // show modal update (sau sẽ code)
  };
  const handleDelete = async (record: any) => {
    try {
      await deleteSpecialty(record.id);
      notification.success({ message: "Xóa chuyên khoa thành công" });
      setReload(!reload);
    } catch (error) {
      console.error(error);

      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleView = (record: ISpecialty) => {
    setCurrentSpecialty(record);
    setIsViewVisible(true);
  };

  return (
    <div>
      <UserListTitle title="chuyên khoa" />

      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Hủy lọc">
            <Button onClick={handleResetFilter}>
              <RefreshCcw size={17.5} />
            </Button>
          </Tooltip>
          <Input
            value={keyword}
            placeholder="Tìm chuyên khoa"
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => setReload(!reload)}
          />
          <Button type="primary" onClick={() => setReload(!reload)}>
            <Search size={17.5} />
          </Button>
        </Flex>

        <Button
          type="primary"
          icon={<CirclePlus size={16} />}
          onClick={() => setIsCreateVisible(true)}
        >
          Thêm chuyên khoa
        </Button>
      </Flex>

      <Flex gap={10} style={{ marginBottom: 10 }}>
        <Form>  
          <Form.Item label="Sắp xếp" style={{ width: '220px' }} name="sort" valuePropName="sort" > 
            <Select
              style={{ width: 150 }}
              value={sort}
              onChange={(value) => setSort(value)}
              options={[
                { value: "name_asc", label: "Tên A-Z" },
                { value: "name_desc", label: "Tên Z-A" },
              ]}
            />
          </Form.Item>
        </Form>
      </Flex>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={specialties}
        pagination={pagination}
        onChange={(e: any) => { handleTableChange(e) }}
        scroll={{ x: 600, y: 500 }}
      />

      {/* ModalCreateSpecialty, ModalUpdateSpecialty sẽ thêm sau */}
      <ModalCreateSpecialty
        isVisible={isCreateVisible}
        handleOk={() => setIsCreateVisible(false)}
        handleCancel={() => setIsCreateVisible(false)}
        form={formCreate}
        onCreated={() => setReload(!reload)}
      />
      <ModalUpdateSpecialty isVisible={isUpdateVisible} handleOk={() => setIsUpdateVisible(false)} handleCancel={() => setIsUpdateVisible(false)} form={formUpdate} currentSpecialty={currentSpecialty} onUpdated={() => setReload(!reload)} />
      <ModalViewSpecialty
        isVisible={isViewVisible}
        handleCancel={() => setIsViewVisible(false)}
        form={formUpdate}
        specialty={currentSpecialty}
      />
    </div>
  );
};

export default AdminSpecialtyDashboard;
