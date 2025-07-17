import { Modal, Form, Input, InputNumber, Descriptions, type FormInstance } from "antd";
import { useState } from "react";

interface IProps {
  isVisible: boolean;
  handleCancel: () => void;
  form: FormInstance;
  medicine?: any;
}

const ModalViewMedicine = ({ isVisible, handleCancel, form, medicine }: IProps) => {
  return (
    <Modal
          open={isVisible}
          title="Thông tin thuốc"
          cancelText="Đóng"
          footer={null}
          onCancel={handleCancel}
          destroyOnHidden
          centered
          width={600} >
          <Descriptions
              column={1}
              bordered
              size="small"
              style={{ marginTop: 20 }}
          >
              <Descriptions.Item label="ID" span={1}>
                  {medicine?.id}
              </Descriptions.Item>
              <Descriptions.Item label="Tên thuốc" span={1}>
                  {medicine?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng" span={1}>
                  {medicine?.stock}
              </Descriptions.Item>
              <Descriptions.Item label="Giá tiền" span={1}>
                  {medicine?.price ? `${medicine.price.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
              </Descriptions.Item>
              {medicine?.note && (
                  <Descriptions.Item label="Ghi chú" span={1}>
                      {medicine.note}
                  </Descriptions.Item>
              )}
              {medicine?.dosage && (
                  <Descriptions.Item label="Liều dùng" span={1}>
                      {medicine.dosage}
                  </Descriptions.Item>
              )}
              {medicine?.frequency && (
                  <Descriptions.Item label="Tần suất" span={1}>
                      {medicine.frequency}
                  </Descriptions.Item>
              )}
              {medicine?.duration && (
                  <Descriptions.Item label="Thời gian điều trị" span={1}>
                      {medicine.duration}
                  </Descriptions.Item>
              )}
              {medicine?.created_at && (
                  <Descriptions.Item label="Ngày tạo" span={1}>
                      {new Date(medicine.created_at).toLocaleString('vi-VN')}
                  </Descriptions.Item>
              )}
              {medicine?.updated_at && (
                  <Descriptions.Item label="Ngày cập nhật" span={1}>
                      {new Date(medicine.updated_at).toLocaleString('vi-VN')}
                  </Descriptions.Item>
              )}
          </Descriptions>
    </Modal>
  );
};

export default ModalViewMedicine; 