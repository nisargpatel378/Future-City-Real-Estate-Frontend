import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Input, Select, Spin } from 'antd';
import { SearchOutlined, HomeOutlined, UserOutlined, MessageOutlined, StarOutlined, RightOutlined } from '@ant-design/icons';
import { getFeatured, getLatest } from '../../api';
import PropertyCard from '../../components/property/PropertyCard';

const { Title, Text, Paragraph } = Typography;

const CATEGORIES = [
  { icon: '🏠', label: 'Residential', type: 'Residential', color: '#6366f1' },
  { icon: '🏢', label: 'Commercial',  type: 'Commercial',  color: '#8b5cf6' },
  { icon: '🏗️', label: 'Apartment',   type: 'Apartment',   color: '#06b6d4' },
  { icon: '🏡', label: 'Villa',        type: 'Villa',        color: '#10b981' },
  { icon: '🏙️', label: 'Penthouse',   type: 'Penthouse',   color: '#f59e0b' },
  { icon: '🏬', label: 'Office',       type: 'Office',       color: '#ef4444' },
  { icon: '🏪', label: 'Shop',         type: 'Shop',         color: '#ec4899' },
  { icon: '🌱', label: 'Land',         type: 'Land',         color: '#84cc16' },
];

const STATS = [
  { icon: <HomeOutlined />,    value: 50,  suffix: '+', label: 'Properties Listed' },
  { icon: <UserOutlined />,    value: 200, suffix: '+', label: 'Happy Clients' },
  { icon: <StarOutlined />,    value: 14,  suffix: '+', label: 'Prime Locations' },
  { icon: <MessageOutlined />, value: 98,  suffix: '%', label: 'Satisfaction Rate' },
];

const FEATURES = [
  { icon: '🔍', title: 'Smart Search',       desc: 'Filter by type, price, area, bedrooms and more with AI-assisted recommendations.',    color: '#6366f1' },
  { icon: '💎', title: 'Premium Listings',   desc: 'Curated high-quality properties verified and photographed by our expert team.',        color: '#8b5cf6' },
  { icon: '🤝', title: 'Expert Guidance',    desc: 'Dedicated agents available 7 days a week to guide your property journey.',            color: '#06b6d4' },
  { icon: '🔒', title: 'Secure & Transparent', desc: 'Safe, documented and legally compliant property transactions every time.',          color: '#10b981' },
];

const TESTIMONIALS = [
  { name: 'Rahul Patel',  role: 'Home Buyer',        text: 'Found my dream home in Prahlad Nagar through Future City. The process was seamless and the team was incredibly helpful throughout.', avatar: '👨', rating: 5 },
  { name: 'Priya Shah',   role: 'Property Investor',  text: 'Excellent platform for property investment. Great listings with detailed information, verified photos, and very responsive support.', avatar: '👩', rating: 5 },
  { name: 'Amit Mehta',   role: 'Commercial Tenant',  text: 'Rented my office space on SG Highway with zero hassle. The best real estate experience I\'ve had in Ahmedabad!', avatar: '👨‍💼', rating: 5 },
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size:  Math.random() * 6 + 3,
  left:  Math.random() * 100,
  delay: Math.random() * 12,
  dur:   Math.random() * 12 + 12,
  opacity: Math.random() * 0.4 + 0.1,
}));

/* Animated counter hook */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* Scroll reveal hook */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* Stat counter component */
function StatItem({ stat, index, inView }) {
  const count = useCountUp(stat.value, 1600, inView);
  return (
    <Col xs={12} md={6} style={{ textAlign: 'center' }}>
      <div className="stat-item" style={{ animationDelay: `${index * 0.12}s` }}>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}>{stat.icon}</div>
        <div className="stat-number">{count}{stat.suffix}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
      </div>
    </Col>
  );
}

export default function Home() {
  const [featured, setFeatured]       = useState([]);
  const [latest, setLatest]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchValues, setSearchValues] = useState({ keyword: '', purpose: '', propertyType: '' });
  const [statsInView, setStatsInView] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef  = useRef(null);
  const navigate  = useNavigate();

  useScrollReveal();

  useEffect(() => {
    Promise.all([getFeatured(), getLatest(8)])
      .then(([f, l]) => { setFeatured(f.data); setLatest(l.data); })
      .finally(() => setLoading(false));
  }, []);

  /* Stats intersection */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsInView(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  /* Testimonial auto-rotate */
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchValues.keyword)      params.set('keyword', searchValues.keyword);
    if (searchValues.purpose)      params.set('purpose', searchValues.purpose);
    if (searchValues.propertyType) params.set('propertyType', searchValues.propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background image overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.08,
        }} />

        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', top: '-150px', right: '-100px', animation: 'float 10s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', bottom: '-100px', left: '5%', animation: 'float 14s 3s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', top: '40%', left: '30%', animation: 'float 18s 6s ease-in-out infinite' }} />
        </div>

        {/* Floating particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {PARTICLES.map(p => (
            <div key={p.id} className="particle" style={{
              width: p.size, height: p.size,
              left: `${p.left}%`,
              bottom: '-20px',
              opacity: p.opacity,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              background: `rgba(${p.id % 3 === 0 ? '99,102,241' : p.id % 3 === 1 ? '139,92,246' : '6,182,212'},0.6)`,
            }} />
          ))}
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={16}>

              {/* Badge */}
              <div className="hero-badge" style={{ marginBottom: 24 }}>
                <span style={{ color: '#818cf8', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>
                  🏆 Ahmedabad's #1 Real Estate Platform
                </span>
              </div>

              {/* Title */}
              <div className="hero-title">
                <h1 style={{
                  color: '#fff',
                  fontSize: 'clamp(36px, 5.5vw, 68px)',
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  margin: '0 0 24px',
                }}>
                  Discover Your{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    Perfect Home
                  </span>
                  <br />in Ahmedabad
                </h1>
              </div>

              {/* Subtitle */}
              <p className="hero-subtitle" style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 18,
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 580,
              }}>
                Browse <strong style={{ color: '#a78bfa' }}>50+ premium properties</strong> across Prahlad Nagar, SG Highway, Bopal, Satellite & Thaltej. Find your dream space today.
              </p>

              {/* Search Box */}
              <div className="hero-search glass" style={{
                padding: 20,
                borderRadius: 20,
                boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
              }}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} md={9}>
                    <Input
                      size="large"
                      prefix={<SearchOutlined style={{ color: '#6366f1' }} />}
                      placeholder="Search by keyword, area..."
                      value={searchValues.keyword}
                      onChange={e => setSearchValues(p => ({ ...p, keyword: e.target.value }))}
                      onPressEnter={handleSearch}
                      style={{ borderRadius: 10 }}
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Select
                      size="large" style={{ width: '100%' }} placeholder="Purpose"
                      allowClear value={searchValues.purpose || undefined}
                      onChange={v => setSearchValues(p => ({ ...p, purpose: v || '' }))}
                      options={[{ value: 'Sale', label: '🏷️ For Sale' }, { value: 'Rent', label: '🔑 For Rent' }]}
                    />
                  </Col>
                  <Col xs={12} md={5}>
                    <Select
                      size="large" style={{ width: '100%' }} placeholder="Type"
                      allowClear value={searchValues.propertyType || undefined}
                      onChange={v => setSearchValues(p => ({ ...p, propertyType: v || '' }))}
                      options={CATEGORIES.map(c => ({ value: c.type, label: `${c.icon} ${c.label}` }))}
                    />
                  </Col>
                  <Col xs={24} md={4}>
                    <Button
                      type="primary" size="large" icon={<SearchOutlined />}
                      onClick={handleSearch} block
                      className="btn-premium"
                      style={{
                        height: 40, borderRadius: 10, fontWeight: 700,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(99,102,241,0.5)',
                      }}
                    >
                      Search
                    </Button>
                  </Col>
                </Row>

                {/* Quick filters */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {['Prahlad Nagar', 'SG Highway', 'Bopal', 'Satellite', 'Thaltej'].map(loc => (
                    <button
                      key={loc}
                      onClick={() => { setSearchValues(p => ({ ...p, keyword: loc })); setTimeout(handleSearch, 50); }}
                      style={{
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 20, padding: '3px 12px', fontSize: 12, color: '#a5b4fc',
                        cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', fontWeight: 500,
                      }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.25)'; e.target.style.color = '#fff'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(99,102,241,0.12)'; e.target.style.color = '#a5b4fc'; }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </Col>

            {/* Hero right — floating stat cards */}
            <Col xs={0} lg={8}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Properties Listed', value: '50+', icon: '🏠', color: '#6366f1' },
                  { label: 'Happy Clients',     value: '200+', icon: '😊', color: '#8b5cf6' },
                  { label: 'Avg. Response',     value: '< 2h', icon: '⚡', color: '#06b6d4' },
                ].map((card, i) => (
                  <div key={i} className="glass" style={{
                    borderRadius: 16, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    animation: `fadeInUp 0.6s ${0.5 + i * 0.15}s both`,
                    boxShadow: `0 8px 30px rgba(0,0,0,0.2)`,
                  }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{card.icon}</div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{card.value}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{card.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* =========================================================
          STATS BAR
      ========================================================= */}
      <div ref={statsRef} style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        padding: '48px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[32, 32]} justify="center">
            {STATS.map((s, i) => <StatItem key={i} stat={s} index={i} inView={statsInView} />)}
          </Row>
        </div>
      </div>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}
      <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-badge">Property Types</div>
          <Title level={2} className="section-title" style={{ marginTop: 8, marginBottom: 8 }}>
            Browse by Category
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Explore our diverse range of property types across Ahmedabad
          </Text>
        </div>
        <Row gutter={[16, 16]}>
          {CATEGORIES.map((cat, i) => (
            <Col key={cat.type} xs={12} sm={8} md={6} lg={3}>
              <div
                className={`category-card reveal stagger-${i + 1}`}
                onClick={() => navigate(`/properties?propertyType=${cat.type}`)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16,
                  padding: '20px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span className="category-icon">{cat.icon}</span>
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* =========================================================
          FEATURED PROPERTIES
      ========================================================= */}
      <div style={{ background: 'var(--bg-section)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-badge">Handpicked for you</div>
              <Title level={2} className="section-title section-title-underline" style={{ margin: '8px 0 4px' }}>⭐ Featured Properties</Title>
              <Text style={{ color: 'var(--text-secondary)' }}>Premium listings curated by our expert team</Text>
            </div>
            <Button
              onClick={() => navigate('/properties?featured=true')}
              className="btn-premium"
              style={{
                background: 'var(--grad-primary)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 600, height: 40, paddingInline: 24,
              }}
            >
              View All <RightOutlined />
            </Button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
          ) : (
            <Row gutter={[24, 24]}>
              {featured.map((p, i) => (
                <Col key={p.id} xs={24} sm={12} lg={8} xl={6}
                  className={`reveal stagger-${Math.min(i + 1, 8)}`}>
                  <PropertyCard property={p} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      {/* =========================================================
          LATEST PROPERTIES
      ========================================================= */}
      <div style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="section-badge">Just Added</div>
            <Title level={2} className="section-title section-title-underline" style={{ margin: '8px 0 4px' }}>🆕 Latest Properties</Title>
            <Text style={{ color: 'var(--text-secondary)' }}>Fresh listings added this week</Text>
          </div>
          <Button
            onClick={() => navigate('/properties')}
            className="btn-premium"
            style={{
              background: 'var(--grad-primary)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 600, height: 40, paddingInline: 24,
            }}
          >
            Browse All <RightOutlined />
          </Button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {latest.map((p, i) => (
              <Col key={p.id} xs={24} sm={12} lg={8} xl={6}
                className={`reveal stagger-${Math.min(i + 1, 8)}`}>
                <PropertyCard property={p} />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* =========================================================
          WHY CHOOSE US
      ========================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 100%)',
        padding: '80px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-badge" style={{ background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)', color: '#a78bfa' }}>Why Us</div>
            <Title level={2} className="section-title" style={{ margin: '8px 0 8px', color: '#fff' }}>
              Why Choose <span className="gradient-text">Future City?</span>
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
              Your trusted real estate partner in Ahmedabad since 2015
            </Text>
          </div>
          <Row gutter={[24, 24]}>
            {FEATURES.map((f, i) => (
              <Col key={i} xs={24} sm={12} md={6} className={`reveal stagger-${i + 1}`}>
                <div className="feature-card glass" style={{ padding: '32px 24px', height: '100%', borderRadius: 24 }}>
                  <div className="feature-icon-wrap" style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}88)` }}>
                    {f.icon}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{f.desc}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* =========================================================
          TESTIMONIALS
      ========================================================= */}
      <div style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-badge">Client Stories</div>
          <Title level={2} className="section-title" style={{ margin: '8px 0' }}>What Our Clients Say</Title>
        </div>

        {/* Testimonial card */}
        <div className="reveal" style={{ position: 'relative' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card" style={{
              display: i === activeTestimonial ? 'block' : 'none',
              background: 'var(--bg-card)',
              border: '1px solid rgba(99,102,241,0.12)',
              borderRadius: 24,
              padding: '40px 40px 32px',
              boxShadow: 'var(--shadow-xl)',
              animation: 'scaleIn 0.5s ease both',
            }}>
              {/* Stars */}
              <div style={{ marginBottom: 20 }}>
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s} style={{ color: '#f59e0b', fontSize: 20, marginRight: 2 }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 17, lineHeight: 1.8, color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: 28 }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', fontSize: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                style={{
                  width: i === activeTestimonial ? 28 : 8,
                  height: 8, borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: i === activeTestimonial ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.25)',
                  transition: 'all 0.3s ease', padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          CTA SECTION
      ========================================================= */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 6s ease infinite',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div className="reveal">
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)',
              borderRadius: 100, padding: '6px 18px', marginBottom: 20,
              fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)',
            }}>
              🚀 Start Your Property Journey
            </div>
            <Title level={2} style={{ color: '#fff', margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Ready to Find Your Dream Property?
            </Title>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
              Browse our curated listings or get in touch with our expert team today. Your perfect home is just a click away.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                size="large"
                className="btn-premium"
                onClick={() => navigate('/properties')}
                style={{
                  background: '#fff', color: '#6366f1', border: 'none',
                  borderRadius: 12, height: 52, paddingInline: 36,
                  fontWeight: 700, fontSize: 15,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                }}
              >
                Browse Properties
              </Button>
              <Button
                size="large"
                className="btn-premium"
                onClick={() => navigate('/contact')}
                style={{
                  background: 'transparent', color: '#fff',
                  border: '2px solid rgba(255,255,255,0.6)',
                  borderRadius: 12, height: 52, paddingInline: 36,
                  fontWeight: 700, fontSize: 15,
                }}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
