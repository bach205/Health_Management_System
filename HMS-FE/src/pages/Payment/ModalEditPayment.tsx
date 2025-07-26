import { Modal, Table, Input, Button, Space, InputNumber, message, Flex, Typography, Form } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface InvoiceItem {
  description: string;
  amount: number;
}

interface Props {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onSubmit: (data: any[]) => void;
  invoiceItems: any[];
  loading?: boolean;
}

const ModalEditPayment = ({
  modalVisible,
  setModalVisible,
  onSubmit,
  invoiceItems,
  loading = false,
}: Props) => {
  // console.log(invoiceItems)
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [text, setText] = useState<string>("");
  const [value, setValue] = useState<number>(0);
  const [isDiscount, setIsDiscount] = useState<boolean>(false);

  useEffect(() => {
    // setItems(invoiceItems.length > 0 ? invoiceItems : [{ id: 1, description: "", amount: 0 }]);
    let invoices = []

    for (let i = 0; i < invoiceItems.length; i++) {
      console.log("invoiceItems",invoiceItems[i])
      if (invoiceItems[i].description === "Giảm giá BHYT") {
        setIsDiscount(true);
      }
      invoices.push({
        description: invoiceItems[i].description,
        amount: invoiceItems[i].amount,
      })
      // console.log(invoices)
    }

    setItems(invoices);


  }, [invoiceItems]);


  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAddDiscount = () => {
    if (value <= 0) {
      message.warning("Vui lòng nhập số tiền giảm giá BHYT lớn hơn 0.");
      return;
    }
    if (totalAmount < value) {
      message.warning("Tiền giảm giá BHYT không được lớn hơn tổng tiền hóa đơn.");
      return;
    }
    setItems([...items, { description: 'Giảm giá BHYT', amount: -value }]);
    setIsDiscount(true);
  };

  const handleDeleteDiscount = (description: string) => {
    setItems((prev) => prev.filter((item) => item.description !== "Giảm giá BHYT"));
    setIsDiscount(false);
  };


  const handleSubmit = () => {
    if (items.some((item) => !item.description)) {
      message.warning("Vui lòng nhập đầy đủ thông tin các dịch vụ.");
      return;
    }
    onSubmit(items);
    setModalVisible(false);
    setIsDiscount(false);
    setItems([]);
    setValue(0);
  };
  const handleCancel = () => {
    setModalVisible(false);
    setIsDiscount(false);
    setItems([]);
    setValue(0);
  };
  return (
    <Modal
      title="Cập nhật hóa đơn"
      open={modalVisible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      cancelText="Hủy"
      okText="Cập nhật"
      confirmLoading={loading}
      centered
    >
      <Table
        dataSource={items}
        rowKey={(record) => record.description}
        pagination={false}
        columns={[
          { title: 'Dịch vụ', dataIndex: 'description' },
          {
            title: 'Thành tiền',
            dataIndex: 'amount',
            render: (val) => `${val.toLocaleString()}đ`,
          },
          {
            title: "",
            dataIndex: "action",
            width: 50,
            render: (_, record) => record.description === 'Giảm giá BHYT' ? (
              <Button
                icon={<DeleteOutlined />}
                danger
                type="text"
                onClick={() => handleDeleteDiscount(record.description)}
              />
            ) : null,
          },
        ]}
      />


      <Typography.Title level={5} className="mt-4">Thêm giảm giá BHYT</Typography.Title>
      <Flex justify="space-between">
        <Form.Item label="Số tiền giảm giá BHYT">
          <InputNumber
            value={value}
            min={0}
            style={{ flex: 1 }}
            onChange={(val) => setValue(val || 0)}

          />
        </Form.Item>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDiscount} disabled={isDiscount}>
          Thêm
        </Button>
      </Flex>

      <div className="mt-4 text-end">
        <p className="mt-4">
          <strong>Tổng tiền:</strong> {totalAmount.toLocaleString()}đ
        </p>
      </div>
    </Modal>
  );
};

export default ModalEditPayment;
