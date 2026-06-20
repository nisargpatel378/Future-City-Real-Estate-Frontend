import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Badge, Dropdown, Avatar, Space, Switch } from 'antd';
import { HomeOutlined, AppstoreOutlined, HeartOutlined, SwapOutlined, BellOutlined, UserOutlined, MenuOutlined, LogoutOutlined, DashboardOutlined, MailOutlined, MoonFilled, SunFilled } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCompare } from '../../context/CompareContext';
import { getNotifications, markAllRead } from '../../api';

const { Header } = Layout;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const { compareList } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      getNotifications().then(r => { setNotifications(r.data.slice(0, 10)); setUnreadCount(r.data.filter(n => !n.isRead).length); }).catch(() => {});
    }
  }, [isAuthenticated, location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const notifItems = notifications.length > 0 ? [
    ...notifications.map(n => ({ key: n.id, label: (<div style={{ maxWidth: 280 }}><div style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.title}</div><div style={{ fontSize: 12, color: '#888', whiteSpace: 'normal' }}>{n.message}</div></div>) })),
    { type: 'divider' },
    { key: 'markall', label: <span style={{ color: '#1677ff' }} onClick={() => { markAllRead(); setUnreadCount(0); }}>Mark all as read</span> }
  ] : [{ key: 'empty', label: 'No notifications', disabled: true }];

  const userMenuItems = [
    { key: 'profile', label: <Link to="/profile">My Profile</Link>, icon: <UserOutlined /> },
    { key: 'favorites', label: <Link to="/favorites">Favorites</Link>, icon: <HeartOutlined /> },
    { key: 'inquiries', label: <Link to="/inquiries">My Inquiries</Link>, icon: <MailOutlined /> },
    ...(isAdmin ? [{ key: 'dashboard', label: <Link to="/admin/dashboard">Admin Dashboard</Link>, icon: <DashboardOutlined /> }] : []),
    { type: 'divider' },
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true, onClick: handleLogout }
  ];

  const navLinks = [
    { key: '/', label: <Link to="/">Home</Link>, icon: <HomeOutlined /> },
    { key: '/properties', label: <Link to="/properties">Properties</Link>, icon: <AppstoreOutlined /> },
    { key: '/compare', label: <Link to="/compare"><Badge count={compareList.length} size="small">Compare</Badge></Link>, icon: <SwapOutlined /> },
    { key: '/contact', label: <Link to="/contact">Contact</Link>, icon: <MailOutlined /> },
  ];

  return (
    <Header style={{ position: 'sticky', top: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: isDark ? '#141414' : '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Link to="/" style={{ fontSize: 22, fontWeight: 800, color: '#1677ff', textDecoration: 'none', whiteSpace: 'nowrap' }}>🏠 Future City</Link>
      <Menu mode="horizontal" selectedKeys={[location.pathname]} items={navLinks} style={{ flex: 1, justifyContent: 'center', border: 'none', background: 'transparent' }} className="desktop-nav" />
      <Space size="middle">
        <Switch checkedChildren={<MoonFilled />} unCheckedChildren={<SunFilled />} checked={isDark} onChange={toggle} />
        {isAuthenticated ? (
          <>
            <Dropdown menu={{ items: notifItems }} trigger={['click']} placement="bottomRight">
              <Badge count={unreadCount} size="small"><Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} /></Badge>
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Avatar style={{ cursor: 'pointer', background: '#1677ff' }} icon={<UserOutlined />} />
            </Dropdown>
          </>
        ) : (
          <Space>
            <Button onClick={() => navigate('/auth/login')}>Login</Button>
            <Button type="primary" onClick={() => navigate('/auth/register')}>Register</Button>
          </Space>
        )}
        <Button className="mobile-menu-btn" type="text" icon={<MenuOutlined />} onClick={() => setMobileOpen(true)} />
      </Space>
      <Drawer title="Menu" placement="right" onClose={() => setMobileOpen(false)} open={mobileOpen}>
        <Menu mode="inline" items={navLinks} onClick={() => setMobileOpen(false)} />
        {!isAuthenticated && <Space style={{ padding: '16px 0' }}><Button block onClick={() => { navigate('/auth/login'); setMobileOpen(false); }}>Login</Button><Button block type="primary" onClick={() => { navigate('/auth/register'); setMobileOpen(false); }}>Register</Button></Space>}
      </Drawer>
    </Header>
  );
}
