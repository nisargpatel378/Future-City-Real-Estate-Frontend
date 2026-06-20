import { useState, useEffect } from 'react';
import { Table, Button, Tag, Typography, Popconfirm, message, Switch, Avatar, Space, Input } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllUsers, toggleUserStatus, deleteUser } from '../../api';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await getAllUsers(); setUsers(r.data); setFiltered(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (val) => {
    const q = val.toLowerCase();
    setFiltered(users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  };

  const handleToggle = async (id) => {
    await toggleUserStatus(id);
    message.success('User status updated');
    load();
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    message.success('User deleted');
    load();
  };

  const columns = [
    { title: 'User', key: 'user', render: (_, r) => (
      <Space><Avatar icon={<UserOutlined />} style={{ background: '#1677ff' }} /><div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 12, color: '#888' }}>{r.email}</div></div></Space>
    )},
    { title: 'Role', dataIndex: 'role', render: v => <Tag color={v==='Admin'?'red':'blue'}>{v}</Tag> },
    { title: 'Phone', dataIndex: 'phone', render: v => v || '-' },
    { title: 'Active', dataIndex: 'isActive', render: (v, r) => <Switch checked={v} size="small" onChange={() => handleToggle(r.id)} /> },
    { title: 'Joined', dataIndex: 'createdDate', render: v => dayjs(v).format('DD MMM YYYY') },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      r.role !== 'Admin' ? (
        <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
          <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      ) : <Tag>Protected</Tag>
    )}
  ];

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <Title level={3} style={{ margin: 0 }}>?? Manage Users</Title>
        <Input.Search placeholder="Search users..." onSearch={handleSearch} onChange={e => !e.target.value && setFiltered(users)} style={{ width: 280 }} allowClear />
      </div>
      <Table dataSource={filtered} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} style={{ borderRadius: 12 }} scroll={{ x: true }} />
    </div>
  );
}
