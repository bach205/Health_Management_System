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
      {blog && (
        <Descriptions
          column={1}
          bordered
          size="small"
          style={{ marginTop: 20 }}
        >
          <Descriptions.Item label="ID">{blog.id}</Descriptions.Item>
          <Descriptions.Item label="Tiêu đề">{blog.title}</Descriptions.Item>
          <Descriptions.Item label="Nội dung">
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>{blog.content}</div>
          </Descriptions.Item>

          {blog.image_url && (
            <Descriptions.Item label="Hình ảnh">
              <Image
                width={200}
                src={blog.image_url}
                alt={blog.title}
                fallback="..."
              />
            </Descriptions.Item>
          )}

          {blog.category && (
            <Descriptions.Item label="Danh mục">
              <Tag color="blue">{blog.category.name}</Tag>
            </Descriptions.Item>
          )}

          {blog.tags?.length > 0 && (
            <Descriptions.Item label="Tags">
              {blog.tags.map((tag: any) => (
                <Tag key={tag.id} color="cyan">{tag.name}</Tag>
              ))}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Trạng thái">
            <Tag color={blog.published ? 'green' : 'orange'}>
              {blog.published ? 'Đã xuất bản' : 'Bản nháp'}
            </Tag>
          </Descriptions.Item>

          {blog.created_at && (
            <Descriptions.Item label="Ngày tạo">
              {dayjs(blog.created_at).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          )}
          {blog.updated_at && (
            <Descriptions.Item label="Ngày cập nhật">
              {dayjs(blog.updated_at).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          )}
        </Descriptions>
      )}
    </Modal>

  );
};

export default ModalViewBlog; 