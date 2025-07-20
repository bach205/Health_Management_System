import { useEffect, useState } from "react";
import { getConversationsByUserId } from "../../api/conversation";
import { Card, Typography, Avatar, Space } from "antd";
import { useAuthStore } from "../../store/authStore"; // ✅ dùng zustand thay vì redux

import type { IConversation } from "../../types/index.type";
const getConversationTitle = (conversation: IConversation, currentUserId: string) => {
  if (conversation.type === 'group') {
    return conversation.name;
  } else {
    const other = conversation.participants.find(p => p.id !== currentUserId);
    return other?.full_name || 'Không rõ';
  }
};
const ConversationList = ({
  onSelect,
}: {
  onSelect: (conversation: IConversation) => void;
}) => {
  const [conversations, setConversations] = useState<IConversation[]>([]);

  // ✅ lấy user từ zustand thay vì redux
  const user = useAuthStore((s) => s.user);


  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      console.log("currentUser", user); // <- kiểm tra kỹ có đúng ID không

      const res = await getConversationsByUserId(user.id);

      setConversations(res.data.metadata);
    };
    fetchData();
  }, [user]);


  return (
    <div style={{ padding: 10 }}>
      <Typography.Title level={5}>Danh sách hội thoại</Typography.Title>
      <Space direction="vertical" style={{ width: "100%" }}>
        {conversations.map((c) => {
          console.log("type:", c.type, " ", c);
          if (!c.participants || c.participants.length === 0) return null;
          const other = c.participants.find(p => p.id !== user!.id);
          return (
            <Card key={c.id} onClick={() => onSelect(c)} hoverable>
              <Card.Meta
                avatar={
                  c.type === 'group'
                    ? <Avatar style={{ backgroundColor: '#87d068' }}>{c.name[0]}</Avatar> // nhóm: icon tên viết tắt
                    : <Avatar src={other?.photo} /> // 1-1: ảnh của người kia
                }
                title={<span>{getConversationTitle(c, user!.id)}</span>}
                description={
                  c.type === 'group'
                    ? c.participants.map((p) => p.full_name).join(', ') // nhóm: liệt kê thành viên
                    : other?.email // 1-1: hiện email người kia
                }
              />
            </Card>

          );
        })}
      </Space>
    </div>
  );
};

export default ConversationList;
