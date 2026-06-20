import { useState, useEffect } from 'react';
import { Table, Typography, Tag, Button, Spin } from 'antd';
import { getContactMessages, markContactRead } from '../../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const r = await getContactMessages(); setMessages(r.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => { await markContactRead(id); load(); };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v, r) => <><div style={{ fontWeight: r.isRead ? 400 : 700 }}>{v}</div><div style={{ fontSize: 12, color: '#888' }}>{r.email}</div></> },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Message', dataIndex: 'message', key: 'message', render: v => <Text ellipsis style={{ maxWidth: 300 }}>{v}</Text> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: v => v || '-' },
    { title: 'Status', dataIndex: 'isRead', key: 'isRead', render: v => <Tag color={v ? 'default' : 'green'}>{v ? 'Read' : 'New'}</Tag> },
    { title: 'Date', dataIndex: 'createdDate', key: 'date', render: v => dayjs(v).format('DD MMM YYYY HH:mm') },
    { title: 'Action', key: 'action', render: (_, r) => !r.isRead && <Button size="small" type="link" onClick={() => handleMarkRead(r.id)}>Mark Read</Button> }
  ];

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 20 }}>?? Contact Messages</Title>
      {loading ? <Spin /> : <Table dataSource={messages} columns={columns} rowKey="id" pagination={{ pageSize: 15 }} style={{ borderRadius: 12 }} scroll={{ x: true }} rowClassName={r => !r.isRead ? 'unread-row' : ''} />}
    </div>
  );
}
