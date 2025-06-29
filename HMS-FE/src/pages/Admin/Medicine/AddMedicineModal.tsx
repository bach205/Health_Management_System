import { Modal, Input, InputNumber, Radio, Form, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

interface IProps {
    showAddModal: boolean,
    setShowAddModal: (show: boolean) => void;
}
const AddMedicineModal = ({ showAddModal,setShowAddModal }: IProps) => {
    const [form] = Form.useForm();
    // const [showAddModal, setShowAddModal] = useState(false);
    const [isCreate, setIsCreate] = useState(true);
    const [filterDate, setFilterDate] = useState(dayjs());
    const [keyword, setKeyword] = useState("");
    const [listMedicine, setListMedicine] = useState([]);
    const [listMedicineFilter, setListMedicineFilter] = useState([]);
    const [initLoading, setInitLoading] = useState(true);
    const [reload, setReload] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
    });

    const handleResearch = () => {
        setKeyword("");
        setReload(!reload);
    };


    const handleOk = () => {
        form
            .validateFields()
            .then(async (values) => {
                console.log(values);
                const data = {
                    ...values,
                };

                if (isCreate) {
                    //   await createMedicine(data);
                    message.success({
                        content: "Thêm thuốc thành công",
                    });
                } else {
                    //   await updateMedicine(data);
                    message.success({
                        content: "Cập nhật thuốc thành công",
                    });
                }
                form.resetFields();
                handleCancel();
                setReload(!reload);
            })
            .catch((error) => {
                message.error(error);
                console.error("Error: ", error);
            });
    };

    const handleCancel = () => {
        setShowAddModal(false);
        setIsCreate(true);
    };

    return (
        <div>
            <Modal
                title={isCreate ? "Thêm thuốc" : "Cập nhật thuốc"}
                open={showAddModal}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={isCreate ? "Thêm" : "Cập nhật"}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    labelCol={{ span: 5 }}
                    initialValues={{
                        usage: "after",
                    }}
                    labelAlign="left"
                >
                    <Form.Item name="_id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tên thuốc"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
                    >
                        <Input placeholder="Nhập tên thuốc" />
                    </Form.Item>
                    <Form.Item
                        label="Số lượng"
                        name="quantity"
                        rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        label="Giá tiền"
                        name="price"
                        rules={[
                            {
                                type: "number",
                                min: 100,
                                message: "Vui lòng nhập giá tiền lớn hơn 100",
                            },
                            { required: true, message: "Vui lòng nhập giá tiền" },
                        ]}
                    >
                        <InputNumber min={100} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        label="Cách dùng"
                        name="usage"
                        rules={[{ required: true, message: "Vui lòng nhập cách dùng" }]}
                        valuePropName="value"
                    >
                        <Radio.Group>
                            <Radio value="before">Trước ăn</Radio>
                            <Radio value="after">Sau ăn</Radio>
                            <Radio value="both">Trước / sau ăn</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        label="Ghi chú"
                        name="note"
                        rules={[{ message: "Vui lòng nhập ghi chú" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ message: "Vui lòng nhập mô tả" }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default AddMedicineModal;