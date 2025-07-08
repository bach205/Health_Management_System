import { useEffect, useState } from "react";
import { getConversationsByUserId } from "../../api/conversation";
import { Card, Typography, Avatar, Space } from "antd";
import { useAuthStore } from "../../store/authStore"; // ✅ dùng zustand thay vì redux

import type { IConversation } from "../../types/index.type";

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
          if (!c.participants || c.participants.length === 0) return null;
          const other = c.participants.find(p => p.id !== user!.id);
          return (
            <Card key={c.id} onClick={() => onSelect(c)} hoverable>
              <Card.Meta
                avatar={<Avatar src={other?.photo} />}
                title={other?.fullName || "Người dùng"}
                description={other?.phone}
              />
            </Card>
          );
        })}
      </Space>
    </div>
  );
};

export default ConversationList;
