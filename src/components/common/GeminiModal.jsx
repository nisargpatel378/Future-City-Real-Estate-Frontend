import { useState, useEffect, useRef } from 'react';
import { Button, Input, Space, Spin, Tooltip } from 'antd';
import { SendOutlined, CloseOutlined, RobotOutlined, ClearOutlined } from '@ant-design/icons';
import { searchProperties, getFeatured } from '../../api';
import PropertyCard from '../property/PropertyCard';
import { useLocation } from 'react-router-dom';

export default function GeminiModal() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your Gemini AI Property Assistant. 🌟\n\nHow can I help you find your dream home or commercial space today? Ask me things like:\n- 'Show me featured properties'\n- 'Villas available for sale'\n- 'Apartments for rent'\n- 'Properties in Navrangpura'",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Close modal when navigating
  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const lowerText = text.toLowerCase();
      let botResponseText = "";
      let recommendedProperties = [];

      // Smart Parsing & Dynamic API Calls
      if (lowerText.includes('featured') || lowerText.includes('star') || lowerText.includes('best')) {
        const res = await getFeatured();
        recommendedProperties = res.data.slice(0, 3);
        botResponseText = "Here are our top premium featured listings handpicked just for you:";
      } else {
        // Build search filters based on input text
        const filters = { page: 1, pageSize: 3 };
        
        // Purpose
        if (lowerText.includes('rent') || lowerText.includes('hire') || lowerText.includes('lease')) {
          filters.purpose = 'Rent';
        } else if (lowerText.includes('sale') || lowerText.includes('buy') || lowerText.includes('purchase')) {
          filters.purpose = 'Sale';
        }

        // Property Type
        if (lowerText.includes('villa')) {
          filters.propertyType = 'Villa';
        } else if (lowerText.includes('apartment') || lowerText.includes('flat')) {
          filters.propertyType = 'Apartment';
        } else if (lowerText.includes('commercial')) {
          filters.propertyType = 'Commercial';
        } else if (lowerText.includes('residential')) {
          filters.propertyType = 'Residential';
        } else if (lowerText.includes('penthouse')) {
          filters.propertyType = 'Penthouse';
        } else if (lowerText.includes('office')) {
          filters.propertyType = 'Office';
        } else if (lowerText.includes('shop')) {
          filters.propertyType = 'Shop';
        } else if (lowerText.includes('land') || lowerText.includes('plot')) {
          filters.propertyType = 'Land';
        }

        // Keywords (Ahmedabad Areas)
        const areas = ['navrangpura', 'satellite', 'ghatlodia', 'vastrapur', 'bodakdev', 'prahladnagar', 'ambawadi'];
        for (const area of areas) {
          if (lowerText.includes(area)) {
            filters.keyword = area.charAt(0).toUpperCase() + area.slice(1);
            break;
          }
        }

        const res = await searchProperties(filters);
        recommendedProperties = res.data.items || [];

        // Dynamic response generation
        const purposeStr = filters.purpose ? ` for ${filters.purpose.toLowerCase()}` : '';
        const typeStr = filters.propertyType ? ` ${filters.propertyType.toLowerCase()} properties` : ' properties';
        const locStr = filters.keyword ? ` in ${filters.keyword}` : '';

        if (recommendedProperties.length > 0) {
          botResponseText = `I found ${res.data.totalCount} matching${typeStr}${purposeStr}${locStr} on our portal. Here are the top suggestions:`;
        } else {
          botResponseText = `I couldn't find any exact matches for your request on the portal right now. However, check out these latest properties that might interest you:`;
          // Fallback to latest properties
          const latestRes = await searchProperties({ page: 1, pageSize: 3 });
          recommendedProperties = latestRes.data.items || [];
        }
      }

      // Add delay to simulate AI thinking
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'bot',
            text: botResponseText,
            properties: recommendedProperties,
            time: new Date()
          }
        ]);
        setLoading(false);
      }, 750);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'bot',
            text: "I encountered an error processing your query. Please try searching for featured or sale/rent properties instead!",
            time: new Date()
          }
        ]);
        setLoading(false);
      }, 750);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Chat history cleared. 🧹\n\nHow can I help you find your dream home or commercial space today?",
        time: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div 
        className="gemini-fab" 
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: 'var(--grad-primary)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
          transition: 'all 0.3s var(--ease)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {open ? (
          <CloseOutlined style={{ fontSize: '22px', color: '#fff' }} />
        ) : (
          <div style={{ position: 'relative' }}>
            <span className="float" style={{ fontSize: '24px' }}>✨</span>
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-10px',
              background: 'var(--accent)',
              borderRadius: '8px',
              padding: '1px 6px',
              fontSize: '9px',
              fontWeight: 800,
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              animation: 'pulse-ring 2s infinite'
            }}>AI</span>
          </div>
        )}
      </div>

      {open && (
        <div 
          className="gemini-chat-container fadeInUp"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '420px',
            height: '600px',
            maxHeight: 'calc(80vh - 100px)',
            zIndex: 1000,
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-xl)',
            backdropFilter: 'blur(30px)',
            background: 'rgba(10, 10, 15, 0.85)',
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
                animation: 'pulse-ring 2.5s infinite'
              }} />
              <RobotOutlined style={{ fontSize: '20px', color: 'var(--primary-light)' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
                  Gemini AI Assistant
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Online & ready to search</span>
              </div>
            </div>
            <Space>
              <Tooltip title="Clear chat">
                <Button 
                  type="text" 
                  shape="circle" 
                  icon={<ClearOutlined style={{ color: 'var(--text-muted)' }} />} 
                  onClick={handleClear} 
                />
              </Tooltip>
              <Button 
                type="text" 
                shape="circle" 
                icon={<CloseOutlined style={{ color: '#fff' }} />} 
                onClick={() => setOpen(false)} 
              />
            </Space>
          </div>

          {/* Messages List */}
          <div 
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.map((m) => (
              <div 
                key={m.id} 
                style={{
                  display: 'flex',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: m.sender === 'user' ? 'slideInRight 0.3s var(--ease)' : 'slideInLeft 0.3s var(--ease)'
                }}
              >
                <div 
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.sender === 'user' ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.05)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--glass-border)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '13.5px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {m.text}
                  </p>
                  
                  {/* Embedded properties container */}
                  {m.properties && m.properties.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {m.properties.map(p => (
                        <div key={p.id} className="gemini-embed-card" style={{
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.06)',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setOpen(false);
                          window.location.href = `/properties/${p.slug}`;
                        }}
                        >
                          <div style={{ height: '90px', position: 'relative' }}>
                            <img 
                              src={p.images?.find(i => i.isThumbnail)?.imagePath || p.images?.[0]?.imagePath || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'} 
                              alt={p.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                              <span style={{ fontSize: '9px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontWeight: 600 }}>
                                {p.purpose}
                              </span>
                            </div>
                          </div>
                          <div style={{ padding: '8px 12px' }}>
                            <h4 style={{ margin: 0, fontSize: '12.5px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.title}
                            </h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-light)' }}>
                                {p.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                {p.areaSqFt} sq ft
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)', borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px', border: '1px solid var(--glass-border)',
                }}>
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div 
            style={{
              padding: '8px 16px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              borderTop: '1px solid var(--glass-border)',
              background: 'rgba(0, 0, 0, 0.2)',
              whiteSpace: 'nowrap'
            }}
            className="hide-scrollbar"
          >
            <button 
              onClick={() => handleSend('Show me featured properties')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                borderRadius: '12px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ⭐ Featured Properties
            </button>
            <button 
              onClick={() => handleSend('Villas for sale')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                borderRadius: '12px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🏡 Villas For Sale
            </button>
            <button 
              onClick={() => handleSend('Apartments for rent')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                borderRadius: '12px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🏢 Rent Apartments
            </button>
            <button 
              onClick={() => handleSend('Properties in Navrangpura')}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                borderRadius: '12px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📍 Navrangpura Area
            </button>
          </div>

          {/* Text Input */}
          <div 
            style={{
              padding: '16px',
              borderTop: '1px solid var(--glass-border)',
              background: 'rgba(10, 10, 15, 0.95)'
            }}
          >
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gemini AI..."
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  color: '#fff',
                  borderRadius: '12px',
                  boxShadow: 'none'
                }}
              />
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SendOutlined />} 
                style={{
                  background: input.trim() ? 'var(--grad-primary)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px'
                }}
                disabled={!input.trim()}
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
