import { useEffect, useState } from "react";
import { Card, Row, Col, Select, Button, message, Space } from "antd";
import ConversationList from "./ConversationList";
import MessageBox from "./MessageBox";
import { getUsers } from "../../api/user";
import { createConversation } from "../../api/conversation";
import { useAuthStore } from "../../store/authStore";
import type { IConversation } from "../../types/index.type";
import { getDoctors } from "../../api/doctor";
const ChatPage = () => {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [reload, setReload] = useState(false); // để cập nhật danh sách hội thoại
  const [staffs, setStaffs] = useState<Array<{ id: number | string; fullName: string }>>([]);
  // lấy danh sách user (trừ bản thân)
  useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const res = await getDoctors({
        searchKey: "",
        specialty: ["all"],
        sortBy: "name_asc",
        skip: 0,
        limit: 100,
        isActive: true,
      });

      console.log("res:", res); // thêm dòng này vào
    } catch (err) {
      console.error("Không thể lấy danh sách bác sĩ", err);
    }
  };

  fetchDoctors();
}, []);


  // xử lý tạo hội thoại
  const handleCreateConversation = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      console.log("currentUser:", currentUser);
      console.log("selectedUser:", selectedUser);





      await createConversation({
        participants: [
          {
            id: currentUser.id,
            fullName: currentUser.full_name, // hoặc currentUser.fullName tùy field trong DB
          },
          {
            id: selectedUser.id,
            fullName: selectedUser.fullName,
          },
        ],
      });


      message.success("Tạo hội thoại thành công!");
      setReload((prev) => !prev); // trigger reload hội thoại
    } catch (err) {
      message.error("Lỗi khi tạo hội thoại");
    }
  };

  return (
    <Card bodyStyle={{ padding: 0 }}>
      <Row>
        <Col span={6} style={{ padding: 12 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              placeholder="Chọn người để bắt đầu trò chuyện"
              options={staffs.map((user) => ({
                label: user.fullName,
                value: user.id,
              }))}
            />
            <Button type="primary" block disabled={!selectedUser} onClick={handleCreateConversation}>
              Tạo hội thoại
            </Button>
          </Space>

          <ConversationList
            onSelect={(conversation) => setSelectedConversation(conversation)}
            reload={reload}
          />
        </Col>

        <Col span={18}>
          {selectedConversation && <MessageBox conversation={selectedConversation} />}
        </Col>
      </Row>
    </Card>
  );
};

export default ChatPage;
