import { useEffect, useState } from 'react';
import { Input, Button, Avatar, List, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import avatarImage from '../../assets/chatbot/chatbot_avatar.png';

const { Text } = Typography;
const image_url = avatarImage
const ChatUI = () => {
    const currentUser = 'Me';
    const chatbotRole = "Assistant"
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, user: chatbotRole, content: 'Tôi có thể giúp gì được cho bạn?' }
    ]);
    const [input, setInput] = useState('');
    const [isBlock, setIsBlock] = useState(false);
    const [memInput, setMemInput] = useState("");


    const handleEsClose = () => {
        setIsBlock(false);
        setMemInput("");
    }
    useEffect(() => {
        if (!isBlock) return;
        console.log(isBlock)
        const es = new EventSource(`${import.meta.env.VITE_AI_SERVER}/api/v1/qa?question=${memInput}`)
        es.onmessage = (event) => {
            let newText = event.data;
            if (newText === "") {
                newText = " ";
            }
            if (event.data === "<END>") {
                handleEsClose();
                es.close();
            } else {
                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages];
                    const lastIndex = updatedMessages.length - 1;

                    if (updatedMessages[lastIndex]?.user === chatbotRole) {
                        // Gộp nội dung nếu user cuối là "Me"
                        updatedMessages[lastIndex] = {
                            ...updatedMessages[lastIndex],
                            content: updatedMessages[lastIndex].content + newText,
                        };
                    } else {
                        // Thêm tin nhắn mới nếu user cuối không phải là "Me"
                        updatedMessages.push({
                            id: Date.now(),
                            user: chatbotRole,
                            content: "" + newText, // nếu đã có sẵn input
                        });
                    }

                    return updatedMessages;
                });
            };
        }
        es.onerror = (err) => {
            console.error('Error:', err);
            // Thêm tin nhắn mới nếu user cuối không phải là "Me"
            setMessages([...messages, {
                id: Date.now(),
                user: chatbotRole,
                content: "Có lỗi xảy ra, xin vui lòng thử lại sau", // nếu đã có sẵn input
            }])
            handleEsClose();
            es.close();
        };

        return () => {
            es.close(); // dọn dẹp EventSource nếu component unmount hoặc isBlock thay đổi
        };
    }, [isBlock])

    const handleSend = () => {
        if (!input.trim() || isBlock) return;
        setMessages([...messages, { id: Date.now(), user: currentUser, content: input.trim() }]);
        setMemInput(input);
        setInput('');
        setIsBlock(true);
    };

    return (
        <>
            {!open && (
                <div style={{
                    position: 'fixed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 24,


                    flexDirection: "column",
                    zIndex: 1000,
                    bottom: 24,
                    right: 24,
                }}>
                    <div
                        onClick={() => setOpen(true)}
                        style={{

                            boxShadow: '0 5px 12px rgba(1, 1, 46, 0.75)',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            cursor: 'pointer',
                        }}
                    >
                        <img src={image_url} style={{ borderRadius: "50%" }} />

                    </div>
                    <p style={{ color: "white", fontSize: "15px", backgroundColor: "rgba(1, 1, 46, 0.75)", padding: "5px 10px", borderRadius: "10px" }}>Assistant Chatbot</p>
                </div>
            )}

            {open && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 320,
                        height: 420,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '10px 16px',
                            borderBottom: '1px solid #f0f0f0',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        Assistant Chatbot
                        <span
                            style={{ cursor: 'pointer', fontWeight: 'normal', fontSize: 18 }}
                            onClick={() => setOpen(false)}
                        >
                            ❌
                        </span>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                        <List
                            dataSource={messages}
                            renderItem={(msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        flexDirection: msg.user === currentUser ? 'row-reverse' : 'row',
                                        marginBottom: 12,
                                    }}
                                >
                                    {msg.user === chatbotRole && <Avatar style={{ backgroundColor: '#1890ff', margin: '0 8px' }} src={image_url}>
                                    </Avatar>}
                                    <div
                                        style={{
                                            background: msg.user === currentUser ? '#e6f7ff' : '#f5f5f5',
                                            padding: 10,
                                            borderRadius: 8,
                                            maxWidth: '70%',
                                        }}
                                    >
                                        <Text strong>{msg.user}</Text>
                                        <div>{msg.content}</div>
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    {/* Input */}
                    <div style={{ display: "flex", flexDirection: "row", gap: 10, padding: 10, borderTop: '1px solid #f0f0f0' }}>
                        <Input.TextArea
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            autoSize={{ minRows: 1, maxRows: 3 }}
                            style={{ overflowY: 'auto' }}
                        />
                        <Button
                            type={isBlock ? 'default' : 'primary'}
                            shape="circle"
                            icon={<SendOutlined />}
                            onClick={handleSend}
                            disabled={isBlock}
                            style={{
                                backgroundColor: isBlock ? '#ffffff' : undefined,
                                color: isBlock ? '#000000' : undefined, // chữ màu đen nếu nền trắng
                                borderColor: isBlock ? '#d9d9d9' : undefined // viền xám nhạt
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatUI;
