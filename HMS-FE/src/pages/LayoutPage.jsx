import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Flex,
    Layout,
    Menu,
    Tag,
    Typography,
    theme,
} from "antd";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { TYPE_EMPLOYEE_STR_SHORT, colorOfType } from "../utils/index";
const { Header, Sider, Content } = Layout;

const LayoutPage = () => {

    const user = {}
    const menuSidebars = []
    const { phone, userType, fullName, photo } = {}

    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer, borderRadiusLG }, } = theme.useToken();
    const navigate = useNavigate();

    const selectedMenu = () => {

    };

    const onClickMenu = ({ item }) => {

    };

    return (
        <Layout style={{ height: "100vh" }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light" width={250} >
                <div style={{ height: 64, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", }} >
                    <Typography.Title level={5} style={{ fontWeight: "bold", textAlign: "center", }} >
                        MEDICAL
                    </Typography.Title>
                    {collapsed ? null : (
                        <Tag color={colorOfType[user?.userType]}>
                            <Typography.Text>
                                {TYPE_EMPLOYEE_STR_SHORT[user?.userType]}
                            </Typography.Text>
                        </Tag>
                    )}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={selectedMenu()}
                    items={menuSidebars}
                    onClick={onClickMenu}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                >
                    <Flex justify="space-between" align="center">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: "16px",
                                width: 64,
                                height: 64,
                            }}
                        />

                        <Flex style={{ marginRight: 20 }} align="center" gap={20}>
                            <Button type="text"
                                style={{ paddingLeft: 30 }}
                                onClick={() => navigate("/profile")}
                                icon={<UserOutlined />}
                            >
                                {fullName || phone} 
                            </Button>
                        </Flex>
                    </Flex>
                </Header>
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflow: "auto",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
export default LayoutPage;
