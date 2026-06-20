import { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, HomeOutlined, UserOutlined, MessageOutlined, MailOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/properties', icon: <HomeOutlined />, label: 'Properties' },
  { key: '/admin/users', icon: <UserOutlined />, label: 'Users' },
  { key: '/admin/inquiries', icon: <MessageOutlined />, label: 'Inquiries' },
  { key: '/admin/contact-messages', icon: <MailOutlined />, label: 'Contact Messages' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme={isDark ? 'dark' : 'light'} style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100, boxShadow: '2px 0 8px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '16px 16px 8px', textAlign: 'center' }}>
          {!collapsed ? (
            <div><div style={{ fontSize: 20, fontWeight: 800, color: '#1677ff' }}>?? Admin</div><Text type="secondary" style={{ fontSize: 11 }}>Future City</Text></div>
          ) : <div style={{ fontSize: 20 }}>??</div>}
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} theme={isDark ? 'dark' : 'light'} style={{ border: 'none' }} />
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, padding: '0 16px' }}>
          {!collapsed && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><Avatar size="small" icon={<UserOutlined />} style={{ background: '#1677ff' }} /><Text style={{ fontSize: 12 }}>{user?.name}</Text></div>}
          <Button danger block={!collapsed} shape={collapsed ? 'circle' : 'default'} icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/'); }} size="small">{!collapsed && 'Logout'}</Button>
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', background: isDark ? '#141414' : '#fff' }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <a href="/" style={{ fontSize: 13, color: '#1677ff' }}>? Back to Website</a>
        </Header>
        <Content style={{ padding: 0, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
