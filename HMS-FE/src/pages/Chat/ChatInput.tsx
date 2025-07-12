import { Input, Button, Space } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import { socket } from "../../utils/socket"; // ✅ đúng

import { useAuthStore } from "../../store/authStore";




interface ChatInputProps {
  conversationId: string;
  to: string;
}

const ChatInput = ({ conversationId, to }: ChatInputProps) => {
  const [text, setText] = useState("");
  const user = useAuthStore((state) => state.user);

  const handleSend = () => {
    if (!text.trim() || !user) return;

    const message = {
      text,
      to,
      sendBy: user.id,
      conversationId,
    };

    socket.emit("message", { roomId: conversationId, message });
    setText("");
  };

  return (
    <Space.Compact style={{ width: "100%", paddingTop: 10 }}>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập tin nhắn..."
        onPressEnter={handleSend}
      />
      <Button icon={<SendOutlined />} type="primary" onClick={handleSend}>
        Gửi
      </Button>
    </Space.Compact>
  );
};

export default ChatInput;
