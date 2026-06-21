import { useState, useEffect, useRef } from 'react';
import { Row, Col, List, Card, Typography, Tag, Button, Input, Avatar, Spin, Empty, message, Divider, Space } from 'antd';
import { SendOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { getInquiries, getInquiryById, replyInquiry } from '../../api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLORS = { Open: 'green', InProgress: 'orange', Closed: 'red' };

export default function Inquiries() {
  const { isAdmin } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => { try { const r = await getInquiries(); setInquiries(r.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected?.messages]);

  const selectInquiry = async (inq) => {
    const r = await getInquiryById(inq.id);
    setSelected(r.data);
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setReplying(true);
    try {
      const r = await replyInquiry(selected.id, { message: reply });
      setSelected(prev => ({ ...prev, messages: [...prev.messages, r.data] }));
      setInquiries(prev => prev.map(i => i.id === selected.id ? {...i, status: 'InProgress'} : i));
      setReply('');
    } catch { message.error('Failed to send reply'); } finally { setReplying(false); }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <Title level={2}>{isAdmin ? '📋 All Inquiries' : '💬 My Inquiries'}</Title>
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
        <Row gutter={24} style={{ height: 'calc(100vh - 200px)' }}>
          <Col xs={24} md={8} style={{ overflowY: 'auto', maxHeight: '100%' }}>
            {inquiries.length === 0 ? <Empty description="No inquiries yet" /> : (
              <List dataSource={inquiries} renderItem={inq => (
                <List.Item style={{ cursor: 'pointer', padding: '12px 16px', background: selected?.id === inq.id ? 'rgba(22,119,255,0.08)' : 'transparent', borderRadius: 8, marginBottom: 4, border: selected?.id === inq.id ? '1px solid #1677ff' : '1px solid #f0f0f0' }} onClick={() => selectInquiry(inq)}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} style={{ background: '#1677ff' }} />}
                    title={<span style={{ fontSize: 13, fontWeight: 600 }}>{inq.propertyTitle?.substring(0,30)}...</span>}
                    description={<><Tag color={STATUS_COLORS[inq.status]} size="small">{inq.status}</Tag><br /><Text type="secondary" style={{ fontSize: 11 }}>{dayjs(inq.createdDate).fromNow()}</Text></>}
                  />
                </List.Item>
              )} />
            )}
          </Col>
          <Col xs={24} md={16} style={{ display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
            {!selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: '#888' }}>
                <CustomerServiceOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }} />
                <Text type="secondary">Select an inquiry to view the conversation</Text>
              </div>
            ) : (
              <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                  <Title level={5} style={{ margin: 0 }}>{selected.propertyTitle}</Title>
                  <Space size={4}><Tag color={STATUS_COLORS[selected.status]}>{selected.status}</Tag><Text type="secondary" style={{ fontSize: 12 }}>User: {selected.userName}</Text></Space>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selected.messages.map(msg => {
                    const isMe = (isAdmin && msg.senderType === 'Admin') || (!isAdmin && msg.senderType === 'User');
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', background: isMe ? '#1677ff' : '#f5f5f5', color: isMe ? '#fff' : 'inherit', padding: '10px 16px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
                          <Text style={{ color: 'inherit', fontSize: 14 }}>{msg.message}</Text>
                          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>{dayjs(msg.sentDate).format('HH:mm')}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                {selected.status !== 'Closed' && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                    <TextArea value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a message..." autoSize={{ minRows: 1, maxRows: 4 }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} style={{ flex: 1 }} />
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
