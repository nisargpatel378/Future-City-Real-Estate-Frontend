import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Input, Select, Card, Statistic, Space, Carousel, Spin } from 'antd';
import { SearchOutlined, HomeOutlined, UserOutlined, MessageOutlined, StarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getFeatured, getLatest } from '../../api';
import PropertyCard from '../../components/property/PropertyCard';

const { Title, Text, Paragraph } = Typography;

const CATEGORIES = [
  { icon: '🏠', label: 'Residential', type: 'Residential' },
  { icon: '🏢', label: 'Commercial', type: 'Commercial' },
  { icon: '🏗️', label: 'Apartment', type: 'Apartment' },
  { icon: '🏡', label: 'Villa', type: 'Villa' },
  { icon: '🏙️', label: 'Penthouse', type: 'Penthouse' },
  { icon: '🏬', label: 'Office', type: 'Office' },
  { icon: '🏪', label: 'Shop', type: 'Shop' },
  { icon: '🌱', label: 'Land', type: 'Land' },
];

const TESTIMONIALS = [
  { name: 'Rahul Patel', role: 'Home Buyer', text: 'Found my dream home in Prahlad Nagar through Future City. The process was seamless and the team was very helpful.', avatar: '👨' },
  { name: 'Priya Shah', role: 'Property Investor', text: 'Excellent platform for property investment. Great listings with detailed information and responsive support.', avatar: '👩' },
  { name: 'Amit Mehta', role: 'Commercial Tenant', text: 'Rented my office space on SG Highway. Best real estate experience in Ahmedabad!', avatar: '👨‍💼' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValues, setSearchValues] = useState({ keyword: '', purpose: '', propertyType: '' });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getFeatured(), getLatest(8)]).then(([f, l]) => {
      setFeatured(f.data); setLatest(l.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchValues.keyword) params.set('keyword', searchValues.keyword);
    if (searchValues.purpose) params.set('purpose', searchValues.purpose);
    if (searchValues.propertyType) params.set('propertyType', searchValues.propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', zIndex: 1 }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={14}>
              <div style={{ display: 'inline-block', background: 'rgba(22,119,255,0.2)', border: '1px solid rgba(22,119,255,0.4)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                <Text style={{ color: '#4096ff', fontSize: 14, fontWeight: 600 }}>🏠 Ahmedabad's Premier Real Estate Platform</Text>
              </div>
              <Title style={{ color: '#fff', fontSize: 'clamp(32px,5vw,58px)', lineHeight: 1.2, marginBottom: 20 }}>Find Your Perfect Property in <span style={{ color: '#4096ff' }}>Ahmedabad</span></Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 40 }}>Browse 50+ premium properties across Prahlad Nagar, SG Highway, Bopal, Satellite & more top locations.</Paragraph>
              {/* Search Box */}
              <Card style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} md={8}><Input size="large" prefix={<SearchOutlined />} placeholder="Search by keyword, city, area..." value={searchValues.keyword} onChange={e => setSearchValues(p => ({...p, keyword: e.target.value}))} onPressEnter={handleSearch} /></Col>
                  <Col xs={12} md={6}><Select size="large" style={{ width: '100%' }} placeholder="Purpose" allowClear value={searchValues.purpose || undefined} onChange={v => setSearchValues(p => ({...p, purpose: v || ''}))} options={[{value:'Sale',label:'For Sale'},{value:'Rent',label:'For Rent'}]} /></Col>
                  <Col xs={12} md={6}><Select size="large" style={{ width: '100%' }} placeholder="Property Type" allowClear value={searchValues.propertyType || undefined} onChange={v => setSearchValues(p => ({...p, propertyType: v || ''}))} options={CATEGORIES.map(c => ({value: c.type, label: c.label}))} /></Col>
                  <Col xs={24} md={4}><Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch} block style={{ height: 40 }}>Search</Button></Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#1677ff', padding: '40px 24px' }}>
        <Row gutter={32} justify="center">
          {[{icon: <HomeOutlined />, value: '50+', label:'Properties'},{icon: <UserOutlined />, value: '200+', label:'Happy Clients'},{icon: <StarOutlined />, value: '14+', label:'Locations'},{icon: <MessageOutlined />, value: '98%', label:'Satisfaction'}].map((s,i) => (
            <Col key={i} xs={12} md={6} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{s.label}</div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Categories */}
      <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={2}>Browse by Category</Title>
          <Text type="secondary">Find exactly what you're looking for</Text>
        </div>
        <Row gutter={[16, 16]}>
          {CATEGORIES.map(cat => (
            <Col key={cat.type} xs={12} sm={8} md={6} lg={3}>
              <Card hoverable style={{ textAlign: 'center', borderRadius: 12, cursor: 'pointer' }} onClick={() => navigate(`/properties?propertyType=${cat.type}`)}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{cat.icon}</div>
                <Text strong style={{ fontSize: 13 }}>{cat.label}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured */}
      <div style={{ background: 'var(--ant-color-bg-container, #f5f5f5)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div><Title level={2} style={{ margin: 0 }}>⭐ Featured Properties</Title><Text type="secondary">Handpicked premium listings</Text></div>
            <Button type="primary" ghost onClick={() => navigate('/properties?featured=true')}>View All</Button>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
            <Row gutter={[24, 24]}>
              {featured.map(p => <Col key={p.id} xs={24} sm={12} lg={8} xl={6}><PropertyCard property={p} /></Col>)}
            </Row>
          )}
        </div>
      </div>

      {/* Latest */}
      <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div><Title level={2} style={{ margin: 0 }}>🆕 Latest Properties</Title><Text type="secondary">Recently added listings</Text></div>
          <Button type="primary" ghost onClick={() => navigate('/properties')}>View All</Button>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : (
          <Row gutter={[24, 24]}>
            {latest.map(p => <Col key={p.id} xs={24} sm={12} lg={8} xl={6}><PropertyCard property={p} /></Col>)}
          </Row>
        )}
      </div>

      {/* Why Us */}
      <div style={{ background: 'var(--ant-color-bg-container, #f5f5f5)', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2}>Why Choose Future City?</Title>
          <Text type="secondary">Your trusted real estate partner in Ahmedabad</Text>
          <Row gutter={[32, 32]} style={{ marginTop: 40 }}>
            {[{icon:'🔍',title:'Advanced Search',desc:'Filter by type, price, area, bedrooms and more'},{icon:'💎',title:'Premium Listings',desc:'Curated high-quality properties verified by our team'},{icon:'🤝',title:'Expert Support',desc:'Dedicated agents available 7 days a week'},{icon:'🔒',title:'Secure Transactions',desc:'Safe and transparent property transactions'}].map((f,i) => (
              <Col key={i} xs={24} sm={12} md={6}>
                <Card style={{ borderRadius: 12, height: '100%' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                  <Title level={5}>{f.title}</Title>
                  <Text type="secondary">{f.desc}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}><Title level={2}>What Our Clients Say</Title></div>
        <Carousel autoplay dots>
          {TESTIMONIALS.map((t, i) => (
            <div key={i}>
              <Card style={{ borderRadius: 16, textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{t.avatar}</div>
                <Paragraph style={{ fontSize: 16, fontStyle: 'italic' }}>"{t.text}"</Paragraph>
                <Text strong>{t.name}</Text><br /><Text type="secondary">{t.role}</Text>
              </Card>
            </div>
          ))}
        </Carousel>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #1677ff 0%, #764ba2 100%)', padding: '60px 24px', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#fff' }}>Ready to Find Your Dream Property?</Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginBottom: 32 }}>Browse our listings or contact us today</Paragraph>
        <Space size="large">
          <Button size="large" style={{ borderRadius: 8, height: 48, paddingInline: 32 }} onClick={() => navigate('/properties')}>Browse Properties</Button>
          <Button size="large" type="primary" ghost style={{ borderRadius: 8, height: 48, paddingInline: 32, borderColor: '#fff', color: '#fff' }} onClick={() => navigate('/contact')}>Contact Us</Button>
        </Space>
      </div>
    </div>
  );
}
