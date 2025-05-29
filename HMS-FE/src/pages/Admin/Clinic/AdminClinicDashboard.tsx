import { useEffect, useState } from "react";
import { Table, Tag, Space, Flex, Button, Form, Input, Select, notification, Tooltip, Popconfirm, } from "antd";
import { Ban, CirclePlus, Eye, RefreshCcw, RotateCcw, Search, UserRoundPen, Delete, PenLine} from "lucide-react";


import { useClinicList } from "../../../hooks/useClinic";
import { specialtyOptions, TYPE_EMPLOYEE_STR, PASSWORD_DEFAULT } from "../../../constants/user.const";
import type { IClinicBase, IDoctor } from "../../../types/index.type";
import UserListTitle from "../../../components/ui/UserListTitle";
import ModalCreateClinic from "../../../components/modal/clinic/ModalCreateClinic";
import ModalUpdateClinic from "../../../components/modal/clinic/ModalUpdateClinic";
import ModalViewClinic from "../../../components/modal/clinic/ModalViewClinic";
import { toast } from "react-toastify";
import { createClinicService, deteleClinicService, updateClinicService } from "../../../services/clinic.service";

const AdminClinicDashboard = () => {
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
      title: "Phòng",
      dataIndex: "name",
      key: "name",
      width: 150,//170 + 90 + 120 + 100
      ellipsis: true,
    },

    {
      width: 250,
      title: "Thông tin",
      dataIndex: "description",
      key: "description",
    },

    // action
    {
      title: "Hành động",
      fixed: "right",
      align: "center",
      width: 160,
      ellipsis: true,
      key: "action",
      render: (_: any, record: IClinicBase) => (
        <Space size="small">
          <Tooltip title="Xem thông tin">
            <Button
              type="text"
              onClick={() => handleView(record)}
              icon={<Eye size={17.5} />}
            ></Button>
          </Tooltip>
          
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                type="text"
                onClick={() => handleEdit(record)}
                icon={<PenLine size={17.5} />}
              ></Button>
            </Tooltip>
          <Tooltip title="Xoá Phòng Khám">
            <Popconfirm
              title="Xoá Phòng Khám"
              description="Bạn chắc chắn muốn thực hiện hành động này?"
              onConfirm={() => handleDeleteOk(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="text"
                icon={<Delete size={17.5} style={{ color: 'red' }} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleDeleteOk = async (id: any) => {
  try {
    await deteleClinicService(id);
    notification.success({ message: "Xoá phòng khám thành công" });
    setReload((prev) => !prev); // reload lại danh sách nếu cần
  } catch (error) {
    console.log(error);
    notification.error({ message: "Có lỗi xảy ra" });
  }
};
  const handleView = async (record: IClinicBase) => {
    try {
          // setIsShowSpecialty(record.role === TYPE_EMPLOYEE.doctor);
          formView.setFieldsValue({
            ...record,
          });
          setIsViewVisible(true);
        } catch (error) {
          console.log(error);
          notification.error({ message: "Có lỗi xảy ra" });
        }
  };
  const handleEdit = async (record: IClinicBase) => {
    try {
          formUpdate.setFieldsValue({
            ...record,      
          });
          setIsUpdateVisible(true);
        } catch (error) {
          console.log(error);
          notification.error({ message: "Có lỗi xảy ra" });
        }
  };

  const handleCreateCancel = () => {
    setIsCreateVisible(false);
  };

  const handleUpdateCancel = () => {
    setIsUpdateVisible(false);
  };
  const handleViewCancel = () => {
    setIsViewVisible(false);
  };


  //Submit create clinic
  const handleCreateOk = async () => {
    try {
      const values = await formCreate.validateFields();
      // gọi API thêm
      await createClinicService(values);
      toast.success("Tạo tài khoản thành công");
      formCreate.resetFields();
      setIsCreateVisible(false);
    } catch (error) {
      console.log(error);
    } 
  };

  //Submit update clinic
  const handleUpdateOk = async () => {
    try {
      const data = await formUpdate.getFieldsValue();
      const values = await formUpdate.getFieldValue("id");

      // gọi API cập nhật     
      await updateClinicService(data, values)
      notification.success({ message: "Cập nhật tài khoản thành công" });

      setIsUpdateVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  // custom hook
  const {
    clinic, loading, keyword, reload,  sort, pagination,
    setKeyword, setReload, setSort, handleTableChange,
  } = useClinicList(isCreateVisible, isUpdateVisible);

  return (
    <div>
      <UserListTitle title="phòng khám" />


      {/* filter bar */}
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Flex gap={10}>
          <Tooltip title="Quay lại ban đầu">
            <Button onClick={() => {
              setSort('stt');
              setKeyword('');
              setReload(!reload);
            }}>
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
          Thêm Phòng Khám
        </Button>
      </Flex>
      <Flex gap={10} justify="space-between" style={{ marginBottom: 10 }}>
        <Form>
          <Flex gap={10}>       
            <Form.Item label="Sắp xếp" style={{ width: '220px' }} name="sort" valuePropName="sort" >
              <Select
                style={{ width: 120 }}
                value={sort}
                onChange={(value) => setSort(value)}
                options={[
                  { value: "stt", label: "STT" },
                  { value: "name_asc", label: "Tên A-Z" },
                  { value: "name_desc", label: "Tên Z-A" },
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
        dataSource={clinic}
        pagination={pagination}
        onChange={(e: any) => { handleTableChange(e) }}
        scroll={{ x: 1000, y: 500 }}
      />

      <ModalCreateClinic form={formCreate} handleOk={handleCreateOk} isVisible={isCreateVisible} handleCancel={handleCreateCancel} role={"admin"} ></ModalCreateClinic>
      <ModalUpdateClinic form={formUpdate} handleOk={handleUpdateOk} isVisible={isUpdateVisible} handleCancel={handleUpdateCancel}></ModalUpdateClinic>
      <ModalViewClinic role="doctor" form={formView} isVisible={isViewVisible} handleCancel={handleViewCancel}></ModalViewClinic>

    </div>
  );
}

export default AdminClinicDashboard;