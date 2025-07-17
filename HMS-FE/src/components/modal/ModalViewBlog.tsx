import { Modal, Descriptions, Image, Tag, type FormInstance } from "antd";
import dayjs from "dayjs";

interface IProps {
  isVisible: boolean;
  handleCancel: () => void;
  form: FormInstance;
  blog?: any;
}

const ModalViewBlog = ({ isVisible, handleCancel, form, blog }: IProps) => {
  return (
    <Modal
      open={isVisible}
      title="Thông tin bài viết"
      cancelText="Đóng"
      footer={null}
      onCancel={handleCancel}
      destroyOnClose
      centered
      width={800}
    >
      <Descriptions
        column={1}
        bordered
        size="small"
        style={{ marginTop: 20 }}
      >
        <Descriptions.Item label="ID" span={1}>
          {blog?.id}
        </Descriptions.Item>
        <Descriptions.Item label="Tiêu đề" span={1}>
          {blog?.title}
        </Descriptions.Item>
        <Descriptions.Item label="Nội dung" span={1}>
          <div style={{ maxHeight:200, overflowY: 'auto' }}>
            {blog?.content}
          </div>
        </Descriptions.Item>
        {blog?.image_url && (
          <Descriptions.Item label="Hình ảnh" span={1}>
            <Image
              width={200}
              src={blog.image_url}
              alt={blog.title}
              fallback="data:image/png;base64iVBORw0goAAAANSUhEUgAAAMIAAADDCAYAAADQvc6AAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3dDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4bmgqISBgTEFyFYuLykAsTuAbJEioKOA7kgdjqEvQHEToKwj4DVhAQ5A93GyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2i+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhHj+LhsczNoEnBQYJmJg2CwQcA2dCxKLEuEOYzMPBHMDBsayhILEqEO4DxG0xmrERhM29nYGBddr//5DGRjYNRkY/l7///39///y4Dmn+LgeHANwDrkl1uO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3P3Ik1RnG4W+FgYxN"
            />
          </Descriptions.Item>
        )}
        {blog?.category && (
          <Descriptions.Item label="Danh mục" span={1}>
            <Tag color="blue">{blog.category.name}</Tag>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Trạng thái" span={1}>
          <Tag color={blog?.published ? 'green' : 'orange'}>
            {blog?.published ? 'Đã xuất bản' : 'Bản nháp'}
          </Tag>
        </Descriptions.Item>
        {blog?.created_at && (
          <Descriptions.Item label="Ngày tạo" span={1}>
            {dayjs(blog.created_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        )}
        {blog?.updated_at && (
          <Descriptions.Item label="Ngày cập nhật" span={1}>
            {dayjs(blog.updated_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default ModalViewBlog; 