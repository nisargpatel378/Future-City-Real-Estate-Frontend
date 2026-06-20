import { useState, useEffect, useRef } from 'react';
import { Row, Col, List, Card, Typography, Tag, Button, Input, Avatar, Spin, message, Popconfirm, Space } from 'antd';
import { SendOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getInquiries, getInquiryById, replyInquiry, closeInquiry } from '../../api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const { Title, Text } = Typography;
const { TextArea } = Input;
const STATUS_COLORS = { Open: 'green', InProgress: 'orange', Closed: 'red' };

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => { try { const r = await getInquiries(); setInquiries(r.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected?.messages?.length]);

  const selectInquiry = async (inq) => { const r = await getInquiryById(inq.id); setSelected(r.data); };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setReplying(true);
    try {
      const r = await replyInquiry(selected.id, { message: reply });
      setSelected(prev => ({ ...prev, messages: [...prev.messages, r.data] }));
      setInquiries(prev => prev.map(i => i.id === selected.id ? { ...i, status: 'InProgress' } : i));
      setReply('');
    } catch { message.error('Failed to send reply'); } finally { setReplying(false); }
  };

  const handleClose = async (id) => {
    await closeInquiry(id);
    message.success('Inquiry closed');
    setSelected(prev => ({ ...prev, status: 'Closed' }));
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'Closed' } : i));
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 20 }}>?? Manage Inquiries</Title>
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
        <Row gutter={24} style={{ height: 'calc(100vh - 180px)' }}>
          <Col xs={24} md={8} style={{ overflowY: 'auto', maxHeight: '100%' }}>
            <List dataSource={inquiries} renderItem={inq => (
              <List.Item style={{ cursor: 'pointer', padding: '12px 16px', background: selected?.id === inq.id ? 'rgba(22,119,255,0.08)' : 'transparent', borderRadius: 8, marginBottom: 4, border: `1px solid ${selected?.id === inq.id ? '#1677ff' : '#f0f0f0'}` }} onClick={() => selectInquiry(inq)}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} style={{ background: '#722ed1' }} />}
                  title={<span style={{ fontSize: 13 }}>{inq.userName}</span>}
                  description={<><div style={{ fontSize: 12, color: '#888' }}>{inq.propertyTitle?.substring(0,28)}...</div><Tag color={STATUS_COLORS[inq.status]} size="small">{inq.status}</Tag><Text type="secondary" style={{ fontSize: 11 }}> · {dayjs(inq.createdDate).fromNow()}</Text></>}
                />
              </List.Item>
            )} />
          </Col>
          <Col xs={24} md={16} style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
            {!selected ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>Select an inquiry to view conversation</div> : (
              <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>{selected.propertyTitle?.substring(0,40)}</Text><br />
                    <Space size={4}><Tag color={STATUS_COLORS[selected.status]}>{selected.status}</Tag><Text type="secondary" style={{ fontSize: 12 }}>From: {selected.userName} ({selected.userEmail})</Text></Space>
                  </div>
                  {selected.status !== 'Closed' && (
                    <Popconfirm title="Close this inquiry?" onConfirm={() => handleClose(selected.id)}>
                      <Button size="small" danger icon={<CloseCircleOutlined />}>Close</Button>
                    </Popconfirm>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selected.messages.map(msg => {
                    const isAdmin = msg.senderType === 'Admin';
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', gap: 8 }}>
                        {!isAdmin && <Avatar size="small" icon={<UserOutlined />} style={{ background: '#722ed1', flexShrink: 0, marginTop: 4 }} />}
                        <div style={{ maxWidth: '65%', background: isAdmin ? '#1677ff' : '#f5f5f5', color: isAdmin ? '#fff' : 'inherit', padding: '10px 14px', borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}>
                          <Text style={{ color: 'inherit', fontSize: 14 }}>{msg.message}</Text>
                          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{dayjs(msg.sentDate).format('DD MMM HH:mm')}</div>
                        </div>
                        {isAdmin && <Avatar size="small" style={{ background: '#1677ff', flexShrink: 0, marginTop: 4 }}>A</Avatar>}
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                {selected.status !== 'Closed' && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                    <TextArea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type reply..." autoSize={{ minRows: 1, maxRows: 4 }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} style={{ flex: 1 }} />
                    <Button type="primary" icon={<SendOutlined />} onClick={handleReply} loading={replying} />
                  </div>
                )}
              </Card>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
}
