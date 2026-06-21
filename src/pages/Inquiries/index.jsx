import { useState, useEffect, useRef } from 'react';
import { Typography, Tag, Spin, Empty } from 'antd';
import { SendOutlined, CustomerServiceOutlined, LockOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getInquiries, getInquiryById, replyInquiry } from '../../api';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const STATUS_CONFIG = {
  Open:       { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: '🟢 Open' },
  InProgress: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: '🟡 In Progress' },
  Closed:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: '🔴 Closed' },
};

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
      <div style={{
        background: 'var(--bg-section)', borderRadius: '18px 18px 18px 4px',
        padding: '10px 16px', border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

export default function Inquiries() {
  const { isAdmin, user } = useAuth();
  const [inquiries, setInquiries]   = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [reply, setReply]           = useState('');
  const [replying, setReplying]     = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  const load = async () => {
    try { const r = await getInquiries(); setInquiries(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages, showTyping]);

  const selectInquiry = async (inq) => {
    setSelected(null);
    const r = await getInquiryById(inq.id);
    setSelected(r.data);
  };

  const handleReply = async () => {
    if (!reply.trim() || replying) return;
    const text = reply;
    setReply('');
    setReplying(true);
    setShowTyping(true);

    // Optimistically add user message
    const tempMsg = {
      id: Date.now(), senderType: isAdmin ? 'Admin' : 'User',
      senderId: user?.id, senderName: user?.name,
      message: text, sentDate: new Date().toISOString(),
    };
    setSelected(prev => ({ ...prev, messages: [...prev.messages, tempMsg] }));

    try {
      await new Promise(r => setTimeout(r, 500)); // brief delay for typing indicator feel
      const r = await replyInquiry(selected.id, { message: text });
      setShowTyping(false);
      setInquiries(prev => prev.map(i => i.id === selected.id ? { ...i, status: 'InProgress' } : i));
    } catch {
      setShowTyping(false);
      setSelected(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== tempMsg.id),
      }));
      setReply(text);
    } finally {
      setReplying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); }
  };

  const statusCfg = s => STATUS_CONFIG[s] || STATUS_CONFIG.Open;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-block', background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20,
          padding: '4px 14px', fontSize: 12, fontWeight: 700,
          color: '#6366f1', letterSpacing: '0.06em', marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          {isAdmin ? 'Admin Panel' : 'My Account'}
        </div>
        <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
          {isAdmin ? '📋 All Inquiries' : '💬 My Inquiries'}
        </Title>
        <Text style={{ color: 'var(--text-secondary)' }}>
          {isAdmin ? 'Manage and respond to all customer inquiries' : 'Track and chat about your property inquiries'}
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : (
        <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 220px)', minHeight: 500 }}>

          {/* ===== INQUIRY LIST ===== */}
          <div style={{
            width: 320, flexShrink: 0, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {inquiries.length === 0 ? (
              <Empty
                description={<Text style={{ color: 'var(--text-secondary)' }}>No inquiries yet</Text>}
                style={{ marginTop: 60 }}
              />
            ) : (
              inquiries.map(inq => {
                const cfg = statusCfg(inq.status);
                const isSelected = selected?.id === inq.id;
                return (
                  <div
                    key={inq.id}
                    onClick={() => selectInquiry(inq)}
                    style={{
                      padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                      background: isSelected ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
                      border: `1.5px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'rgba(0,0,0,0.06)'}`,
                      boxShadow: isSelected ? '0 4px 16px rgba(99,102,241,0.12)' : 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, color: '#fff', fontWeight: 700,
                      }}>
                        {isAdmin ? (inq.userName?.charAt(0)?.toUpperCase() || '?') : '🏠'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4,
                        }}>
                          {inq.propertyTitle}
                        </div>
                        {isAdmin && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            👤 {inq.userName}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: cfg.color,
                            background: cfg.bg, padding: '2px 8px', borderRadius: 10,
                          }}>
                            {cfg.label}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {dayjs(inq.createdDate).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ===== CHAT PANEL ===== */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {!selected ? (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 12, color: 'var(--text-secondary)',
                background: 'var(--bg-card)', borderRadius: 20,
                border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: 'rgba(99,102,241,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                }}>
                  <CustomerServiceOutlined style={{ color: '#6366f1' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Select a conversation</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Choose an inquiry from the left to start chatting</div>
              </div>
            ) : (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                background: 'var(--bg-card)', borderRadius: 20, overflow: 'hidden',
                border: '1px solid rgba(99,102,241,0.12)',
                boxShadow: '0 8px 30px rgba(99,102,241,0.08)',
              }}>

                {/* Chat header */}
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.04))',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }}>
                      🏠
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{selected.propertyTitle}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {isAdmin ? `👤 ${selected.userName} · ${selected.userEmail}` : `Inquiry #${selected.id}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: statusCfg(selected.status).color,
                      background: statusCfg(selected.status).bg,
                      padding: '4px 12px', borderRadius: 20,
                    }}>
                      {statusCfg(selected.status).label}
                    </span>
                    {selected.status === 'Closed' && (
                      <LockOutlined style={{ color: '#ef4444', fontSize: 16 }} />
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selected.messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 20 }}>
                      No messages yet. Start the conversation below.
                    </div>
                  )}
                  {selected.messages.map((msg, idx) => {
                    const isMe = (isAdmin && msg.senderType === 'Admin') || (!isAdmin && msg.senderType === 'User');
                    return (
                      <div
                        key={msg.id}
                        className={isMe ? 'chat-bubble-user' : 'chat-bubble-admin'}
                        style={{
                          display: 'flex',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          animationDelay: `${idx * 0.04}s`,
                        }}
                      >
                        {/* Avatar for other party */}
                        {!isMe && (
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginRight: 8, marginTop: 2,
                            background: isAdmin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #10b981, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, color: '#fff', fontWeight: 700,
                          }}>
                            {msg.senderType === 'Admin' ? '⚙️' : (msg.senderName?.charAt(0)?.toUpperCase() || <UserOutlined />)}
                          </div>
                        )}
                        <div style={{ maxWidth: '70%' }}>
                          {/* Sender name */}
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, textAlign: isMe ? 'right' : 'left', fontWeight: 500 }}>
                            {isMe ? 'You' : msg.senderName || (msg.senderType === 'Admin' ? 'Support Team' : 'User')}
                          </div>
                          {/* Bubble */}
                          <div style={{
                            padding: '10px 16px',
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMe
                              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                              : 'var(--bg-section)',
                            color: isMe ? '#fff' : 'var(--text-primary)',
                            fontSize: 14, lineHeight: 1.6,
                            boxShadow: isMe
                              ? '0 4px 16px rgba(99,102,241,0.3)'
                              : '0 2px 8px rgba(0,0,0,0.05)',
                            border: isMe ? 'none' : '1px solid rgba(0,0,0,0.06)',
                            wordBreak: 'break-word',
                          }}>
                            {msg.message}
                          </div>
                          {/* Timestamp */}
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                            {dayjs(msg.sentDate).format('HH:mm')} · {dayjs(msg.sentDate).fromNow()}
                          </div>
                        </div>
                        {/* Avatar for self */}
                        {isMe && (
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginLeft: 8, marginTop: 2,
                            background: isAdmin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #10b981, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, color: '#fff', fontWeight: 700,
                          }}>
                            {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {showTyping && <TypingIndicator />}
                  <div ref={bottomRef} />
                </div>

                {/* Input area */}
                {selected.status !== 'Closed' ? (
                  <div style={{
                    padding: '14px 20px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    background: 'var(--bg-section)',
                    display: 'flex', alignItems: 'flex-end', gap: 10,
                  }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <textarea
                        ref={textareaRef}
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        style={{
                          width: '100%', resize: 'none', border: '1.5px solid rgba(0,0,0,0.1)',
                          borderRadius: 12, padding: '10px 14px', fontSize: 14,
                          fontFamily: 'inherit', lineHeight: 1.5, outline: 'none',
                          background: 'var(--bg-card)', color: 'var(--text-primary)',
                          maxHeight: 100, overflowY: 'auto',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = '#6366f1';
                          e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                          e.target.style.boxShadow = 'none';
                        }}
                        onInput={e => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                        }}
                      />
                    </div>
                    <button
                      onClick={handleReply}
                      disabled={!reply.trim() || replying}
                      className="btn-premium"
                      style={{
                        width: 44, height: 44, borderRadius: 12, border: 'none',
                        background: reply.trim()
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'rgba(0,0,0,0.08)',
                        color: reply.trim() ? '#fff' : 'rgba(0,0,0,0.3)',
                        cursor: reply.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, transition: 'all 0.2s ease', flexShrink: 0,
                        boxShadow: reply.trim() ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
                        fontFamily: 'inherit',
                      }}
                    >
                      <SendOutlined />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.06)',
                    background: 'rgba(239,68,68,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    color: '#ef4444', fontSize: 14, fontWeight: 500,
                  }}>
                    <LockOutlined />
                    This inquiry has been closed
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
