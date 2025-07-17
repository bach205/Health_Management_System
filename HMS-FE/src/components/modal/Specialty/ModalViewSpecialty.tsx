import { Modal, Descriptions, type FormInstance } from "antd";

interface IProps {
  isVisible: boolean;
  handleCancel: () => void;
  form: FormInstance;
  specialty?: any;
}

const ModalViewSpecialty = ({ isVisible, handleCancel, form, specialty }: IProps) => {
  return (
    <Modal
      open={isVisible}
      title="Thông tin chuyên khoa"
      cancelText="Đóng"
      footer={null}
      onCancel={handleCancel}
      destroyOnClose
      centered
      width={600}
    >
      <Descriptions
        column={1}
        bordered
        size="small"
        style={{ marginTop: 20 }}
      >
        <Descriptions.Item label="ID" span={1}>
          {specialty?.id}
        </Descriptions.Item>
        <Descriptions.Item label="Tên chuyên khoa" span={1}>
          {specialty?.name}
        </Descriptions.Item>
        {specialty?.description && (
          <Descriptions.Item label="Mô tả" span={1}>
            {specialty.description}
          </Descriptions.Item>
        )}
        {specialty?.created_at && (
          <Descriptions.Item label="Ngày tạo" span={1}>
            {new Date(specialty.created_at).toLocaleString('vi-VN')}
          </Descriptions.Item>
        )}
        {specialty?.updated_at && (
          <Descriptions.Item label="Ngày cập nhật" span={1}>
            {new Date(specialty.updated_at).toLocaleString('vi-VN')}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default ModalViewSpecialty; 