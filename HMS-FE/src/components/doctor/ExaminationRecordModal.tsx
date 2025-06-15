import { Modal, Form, Input, Button } from "antd";
import { useState } from "react";
import mainRequest from "../../api/mainRequest";
import { toast } from "react-toastify";

interface ExaminationRecordModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  doctorId?: number;
  onSuccess?: () => void;
}

const ExaminationRecordModal = ({
  open,
  onClose,
  patientId,
  doctorId,
  onSuccess,
}: ExaminationRecordModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await mainRequest.post("/examination-records", {
        ...values,
        patient_id: patientId,
        primary_doctor_id: doctorId,
      });
      toast.success("Tạo hồ sơ khám tổng quát thành công!");
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      title="Tạo hồ sơ khám tổng quát"
      okText="Lưu hồ sơ"
      cancelText="Hủy"
      centered
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="pt-2"
      >
        <Form.Item
          name="symptoms"
          label="Triệu chứng"
          rules={[{ required: true, message: "Vui lòng nhập triệu chứng" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="final_diagnosis"
          label="Chẩn đoán cuối cùng"
          rules={[{ required: true, message: "Vui lòng nhập chẩn đoán cuối cùng" }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExaminationRecordModal;
