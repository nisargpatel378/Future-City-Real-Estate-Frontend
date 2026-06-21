import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Badge, Dropdown, Avatar, Switch, Drawer } from 'antd';
import { HomeOutlined, AppstoreOutlined, HeartOutlined, SwapOutlined, BellOutlined, UserOutlined, MenuOutlined, LogoutOutlined, DashboardOutlined, MailOutlined, MoonFilled, SunFilled } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCompare } from '../../context/CompareContext';
import { getNotifications, markAllRead } from '../../api';

const NAV_LINKS = [
  { path: '/',           label: 'Home',       icon: '🏠' },
  { path: '/properties', label: 'Properties', icon: '🏢' },
  { path: '/compare',    label: 'Compare',    icon: '⚖️', badge: true },
  { path: '/contact',    label: 'Contact',    icon: '📬' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggle }    = useTheme();
  const { compareList }       = useCompare();
  const navigate              = useNavigate();
  const location              = useLocation();
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [scrolled, setScrolled]           = useState(false);

  /* Scroll detection */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Load notifications */
  useEffect(() => {
    if (!isAuthenticated) return;
    getNotifications()
      .then(r => {
        setNotifications(r.data.slice(0, 10));
        setUnreadCount(r.data.filter(n => !n.isRead).length);
      })
      .catch(() => {});
  }, [isAuthenticated, location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const notifItems = notifications.length > 0 ? [
    ...notifications.map(n => ({
      key: n.id,
      label: (
        <div style={{ maxWidth: 280, padding: '4px 0' }}>
          <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 13 }}>{n.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'normal', lineHeight: 1.5 }}>{n.message}</div>
        </div>
      ),
    })),
    { type: 'divider' },
    {
      key: 'markall',
      label: (
        <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 13 }}
          onClick={() => { markAllRead(); setUnreadCount(0); }}>
          ✓ Mark all as read
        </span>
      ),
    },
  ] : [{ key: 'empty', label: <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No notifications</span>, disabled: true }];

  const userMenuItems = [
    {
      key: 'header', disabled: true,
      label: (
        <div style={{ padding: '4px 0 8px' }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.email}</div>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'profile',   label: <Link to="/profile">My Profile</Link>,   icon: <UserOutlined /> },
    { key: 'favorites', label: <Link to="/favorites">Saved Homes</Link>, icon: <HeartOutlined /> },
    { key: 'inquiries', label: <Link to="/inquiries">My Inquiries</Link>, icon: <MailOutlined /> },
    ...(isAdmin ? [{ key: 'dashboard', label: <Link to="/admin/dashboard">Admin Panel</Link>, icon: <DashboardOutlined />, style: { color: '#6366f1' } }] : []),
    { type: 'divider' },
    { key: 'logout', label: 'Sign Out', icon: <LogoutOutlined />, danger: true, onClick: handleLogout },
  ];

  /* Shared nav bg */
  const navBg = isDark
    ? scrolled ? 'rgba(10,10,15,0.92)' : 'rgba(10,10,15,0.7)'
    : scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.82)';

  return (
    <>
      <header
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        style={{
          position: 'sticky', top: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          height: 64,
          background: navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}>
              🏠
            </div>
            <span style={{
              fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Future City
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map(link => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
                <div
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8,
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#6366f1' : isDark ? 'rgba(255,255,255,0.75)' : '#374151',
                    background: isActive ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)') : 'transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{link.icon}</span>
                  {link.badge && compareList.length > 0 ? (
                    <Badge count={compareList.length} size="small" color="#6366f1">
                      <span>{link.label}</span>
                    </Badge>
                  ) : (
                    <span>{link.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Dark mode toggle */}
          <Switch
            checkedChildren={<MoonFilled />}
            unCheckedChildren={<SunFilled />}
            checked={isDark}
            onChange={toggle}
            style={{ background: isDark ? '#6366f1' : '#94a3b8' }}
          />

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Dropdown menu={{ items: notifItems }} trigger={['click']} placement="bottomRight">
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, transition: 'all 0.2s',
                    border: '1px solid transparent',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                  >
                    <BellOutlined style={{ color: isDark ? '#fff' : '#374151' }} />
                  </div>
                  {unreadCount > 0 && (
                    <div style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ef4444, #ec4899)',
                      color: '#fff', fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
              </Dropdown>

              {/* User avatar */}
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <div style={{
                  width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#fff',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(99,102,241,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.35)'; }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
                </div>
              </Dropdown>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => navigate('/auth/login')}
                style={{
                  height: 36, paddingInline: 16, borderRadius: 8,
                  background: 'transparent', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}`,
                  color: isDark ? '#fff' : '#374151',
                  transition: 'all 0.2s ease', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'; e.currentTarget.style.color = isDark ? '#fff' : '#374151'; }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth/register')}
                className="btn-premium"
                style={{
                  height: 36, paddingInline: 16, borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)', fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            style={{
              width: 38, height: 38, borderRadius: 10, border: 'none',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, color: isDark ? '#fff' : '#374151',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
          >
            <MenuOutlined />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏠</span>
            <span style={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Future City
            </span>
          </div>
        }
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        width={280}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: isActive ? '#6366f1' : 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 500, fontSize: 15,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 18 }}>{link.icon}</span>
                  {link.label}
                  {link.badge && compareList.length > 0 && (
                    <Badge count={compareList.length} size="small" color="#6366f1" style={{ marginLeft: 'auto' }} />
                  )}
                </div>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button onClick={() => { navigate('/auth/login'); setMobileOpen(false); }}
                style={{ height: 44, borderRadius: 10, border: '1.5px solid rgba(99,102,241,0.4)', background: 'transparent', color: '#6366f1', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Sign In
              </button>
              <button onClick={() => { navigate('/auth/register'); setMobileOpen(false); }}
                style={{ height: 44, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
