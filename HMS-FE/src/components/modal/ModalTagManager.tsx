// components/TagManagerModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Input, Button, Table, Popconfirm, message } from 'antd';
import { createTag, deleteTag, getAllTags, updateTag } from '../../api/tag';
import type { ITag } from '../../types/index.type';

interface Props {
  open: boolean;
  onClose: () => void;
  onTagUpdate: () => void; // callback để reload tag list ở BlogForm
}

const ModalTagManager: React.FC<Props> = ({ open, onClose, onTagUpdate }) => {
  const [tags, setTags] = useState<ITag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<ITag | null>(null);

  const loadTags = async () => {
    const res = await getAllTags();
    setTags(res.data.metadata);
  };

  useEffect(() => {
    if (open) loadTags();
  }, [open]);

  const handleCreate = async () => {
    if (!newTag.trim()) return;
    await createTag(newTag);
    message.success('Tạo tag thành công');
    setNewTag('');
    loadTags();
    onTagUpdate();
  };

  const handleUpdate = async () => {
    if (!editingTag) return;
    await updateTag(editingTag.id, editingTag.name);
    message.success('Cập nhật tag thành công');
    setEditingTag(null);
    loadTags();
    onTagUpdate();
  };

  const handleDelete = async (id: number) => {
    await deleteTag(id);
    message.success('Xoá tag thành công');
    loadTags();
    onTagUpdate();
  };

  return (
    <Modal open={open} title="Quản lý Tag" onCancel={onClose} footer={null}>
      <Input.Search
        placeholder="Tên tag mới"
        enterButton="Thêm"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onSearch={handleCreate}
      />

      <Table
        rowKey="id"
        dataSource={tags}
        columns={[
          {
            title: 'Tên tag',
            dataIndex: 'name',
            render: (text, record) =>
              editingTag?.id === record.id ? (
                <Input
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  onPressEnter={handleUpdate}
                />
              ) : (
                text
              ),
          },
          {
            title: 'Hành động',
            render: (_, record) => (
              <>
                {editingTag?.id === record.id ? (
                  <Button onClick={handleUpdate}>Lưu</Button>
                ) : (
                  <Button onClick={() => setEditingTag(record)}>Sửa</Button>
                )}
                <Popconfirm title="Xoá tag này?" onConfirm={() => handleDelete(record.id)}>
                  <Button danger style={{ marginLeft: 8 }}>Xoá</Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
        style={{ marginTop: 16 }}
        pagination={false}
      />
    </Modal>
  );
};

export default ModalTagManager;
