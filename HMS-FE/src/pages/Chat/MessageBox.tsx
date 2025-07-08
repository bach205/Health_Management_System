import { useEffect, useState } from "react";
import { getChatsByConversationId } from "../../api/chat";
import ChatInput from "./ChatInput";
import { socket } from "../../utils/socket"; // ✅ đúng
import { useSelector } from "react-redux";
import type { IConversation } from "../../types/index.type"; 
import type { RootState } from "../../store/authStore";
import type { IChat } from "../../types/index.type";
const MessageBox = ({ conversation }: { conversation: IConversation }) => {
  const [messages, setMessages] = useState<IChat[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!conversation?.id) return;

    const fetchChats = async () => {
      if (conversation?.id != null) {
      const res = await getChatsByConversationId(conversation.id);
      setMessages(res.data.chats || []);
}
    };

    fetchChats();

    socket.emit("joinRoom", conversation.id);
    socket.on("message", (msg) => {
      if (!user) return;
      if (msg.conversationId === conversation.id) {
        msg.position = msg.sendBy === user.id ? "right" : "left";
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [conversation]);

  return (
    <div style={{ padding: 10, height: "80vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
<div style={{ padding: 10 }}>
  {messages.map((m, idx) => (
    <div
      key={idx}
      style={{
        display: "flex",
        justifyContent: m.sendBy === user?.id ? "flex-end" : "flex-start",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          background: m.sendBy === user?.id ? "#daf0ff" : "#f0f0f0",
          padding: "8px 12px",
          borderRadius: "16px",
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        <div style={{ fontSize: "14px" }}>{m.text}</div>
        <div style={{ fontSize: "10px", textAlign: "right", marginTop: 4 }}>
          {new Date(m.createdAt ?? Date.now()).toLocaleTimeString()}
        </div>
      </div>
    </div>
  ))}
</div>



      </div>
      <ChatInput
        conversationId={conversation?.id ? String(conversation.id) : ""}
        to={
          user
            ? conversation?.participants?.find(p => p.id !== user.id)?.id ?? ""
            : ""
        }
      />
    </div>
  );
};

export default MessageBox;
