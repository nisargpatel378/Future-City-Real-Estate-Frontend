import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Tag, Space, Button, Divider, Form, Input, message, Spin, Tabs, Image, Card, Descriptions, List } from 'antd';
import { EnvironmentOutlined, HeartOutlined, HeartFilled, SwapOutlined, ShareAltOutlined, WhatsAppOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getPropertyBySlug, searchProperties, createInquiry, toggleFavorite } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { formatPrice, formatArea, getPropertyTypeColor, getPurposeColor } from '../../utils/helpers';
import PropertyCard from '../../components/property/PropertyCard';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function PropertyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCompare, isInCompare } = useCompare();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    getPropertyBySlug(slug).then(res => {
      setProperty(res.data);
      setFav(res.data.isFavorite);
      searchProperties({ propertyType: res.data.propertyType, page: 1, pageSize: 4 })
        .then(r => setSimilar(r.data.items.filter(p => p.id !== res.data.id).slice(0, 3)));
    }).catch(() => navigate('/properties')).finally(() => setLoading(false));
  }, [slug]);

  const handleFav = async () => {
    if (!isAuthenticated) { message.info('Please login to save favorites'); return; }
    setFavLoading(true);
    try { const r = await toggleFavorite(property.id); setFav(r.data.isFavorite); message.success(r.data.isFavorite ? 'Added to favorites' : 'Removed from favorites'); }
    catch { message.error('Failed'); } finally { setFavLoading(false); }
  };

  const handleInquiry = async (values) => {
    if (!isAuthenticated) { message.info('Please login to send inquiry'); return; }
    setInquiryLoading(true);
    try {
      await createInquiry({ propertyId: property.id, message: values.message });
      message.success('Inquiry sent! We will get back to you soon.');
      form.resetFields();
    } catch { message.error('Failed to send inquiry'); } finally { setInquiryLoading(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div>;
  if (!property) return null;

  const thumbnail = property.images?.find(i => i.isThumbnail)?.imagePath || property.images?.[0]?.imagePath;
  const mapsEmbedUrl = property.latitude && property.longitude
    ? `https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`
    : null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <Row justify="space-between" align="top" style={{ marginBottom: 20 }}>
        <Col xs={24} md={16}>
          <Space style={{ marginBottom: 8 }}>
            <Tag color={getPurposeColor(property.purpose)}>{property.purpose}</Tag>
            <Tag color={getPropertyTypeColor(property.propertyType)}>{property.propertyType}</Tag>
            {property.isFeatured && <Tag color="gold">⭐ Featured</Tag>}
          </Space>
          <Title level={2} style={{ marginBottom: 8 }}>{property.title}</Title>
          <Space><EnvironmentOutlined style={{ color: '#1677ff' }} /><Text type="secondary">{property.address}, {property.city}, {property.state}</Text></Space>
          <div style={{ marginTop: 8 }}><Text type="secondary"><EyeOutlined /> {property.viewCount} views</Text></div>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: 8 }}>
          <Title level={2} style={{ color: '#1677ff', margin: 0 }}>{formatPrice(property.price)}</Title>
          <Text type="secondary">{formatArea(property.areaSqFt)}</Text>
          <div style={{ marginTop: 12 }}>
            <Space>
              <Button icon={fav ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} loading={favLoading} onClick={handleFav}>{fav ? 'Saved' : 'Save'}</Button>
              <Button icon={<SwapOutlined />} type={isInCompare(property.id) ? 'primary' : 'default'} onClick={() => addToCompare(property)}>Compare</Button>
              <Button icon={<ShareAltOutlined />} onClick={() => { navigator.clipboard.writeText(window.location.href); message.success('Link copied!'); }}>Share</Button>
            </Space>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left */}
        <Col xs={24} lg={16}>
          {/* Image Gallery */}
          <Image.PreviewGroup>
            <Row gutter={8}>
              <Col xs={24} sm={16}>{thumbnail && <Image src={thumbnail} alt={property.title} style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 12 }} />}</Col>
              <Col xs={24} sm={8}>
                <Row gutter={[8, 8]}>
                  {property.images?.filter(i => !i.isThumbnail).slice(0, 4).map(img => (
                    <Col key={img.id} span={24}><Image src={img.imagePath} alt="property" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} /></Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Image.PreviewGroup>

          <Tabs style={{ marginTop: 24 }} items={[
            {
              key: 'overview', label: 'Overview',
              children: (
                <>
                  <Descriptions bordered column={{ xs: 1, sm: 2 }} style={{ marginBottom: 24 }}>
                    {property.bedrooms != null && <Descriptions.Item label="🛏️ Bedrooms">{property.bedrooms}</Descriptions.Item>}
                    {property.bathrooms != null && <Descriptions.Item label="🚿 Bathrooms">{property.bathrooms}</Descriptions.Item>}
                    {property.parking != null && <Descriptions.Item label="🚗 Parking">{property.parking} spot(s)</Descriptions.Item>}
                    <Descriptions.Item label="📐 Area">{formatArea(property.areaSqFt)}</Descriptions.Item>
                    <Descriptions.Item label="🏠 Type">{property.propertyType}</Descriptions.Item>
                    <Descriptions.Item label="🎯 Purpose">{property.purpose}</Descriptions.Item>
                    <Descriptions.Item label="📍 City">{property.city}</Descriptions.Item>
                    {property.pincode && <Descriptions.Item label="📮 Pincode">{property.pincode}</Descriptions.Item>}
                  </Descriptions>
                  <Title level={5}>Description</Title>
                  <Paragraph style={{ lineHeight: 1.8 }}>{property.description}</Paragraph>
                </>
              )
            },
            {
              key: 'amenities', label: 'Amenities',
              children: (
                <Row gutter={[16, 16]}>
                  {property.amenities?.map(a => (
                    <Col key={a} xs={12} sm={8} md={6}><Space><CheckCircleOutlined style={{ color: '#52c41a' }} /><Text>{a}</Text></Space></Col>
                  ))}
                  {(!property.amenities || property.amenities.length === 0) && <Text type="secondary">No amenities listed</Text>}
                </Row>
              )
            },
            {
              key: 'map', label: 'Location',
              children: mapsEmbedUrl ? (
                <>
                  <iframe src={mapsEmbedUrl} width="100%" height="350" style={{ border: 0, borderRadius: 12 }} allowFullScreen loading="lazy" title="Property Location" />
                  {property.googleMapsUrl && <div style={{ marginTop: 12 }}><Button icon={<EnvironmentOutlined />} href={property.googleMapsUrl} target="_blank" type="primary" ghost>Open in Google Maps</Button></div>}
                </>
              ) : <Text type="secondary">Location map not available for this property</Text>
            }
          ]} />

          {/* Similar */}
          {similar.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Title level={4}>Similar Properties</Title>
              <Row gutter={[16, 16]}>
                {similar.map(p => <Col key={p.id} xs={24} sm={12}><PropertyCard property={p} /></Col>)}
              </Row>
            </div>
          )}
        </Col>

        {/* Right Sidebar */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
            <Title level={5}>📩 Send an Inquiry</Title>
            <Divider />
            {isAuthenticated ? (
              <Form form={form} layout="vertical" onFinish={handleInquiry}>
                <Form.Item name="message" rules={[{ required: true, message: 'Please enter your message' }]}>
                  <TextArea rows={5} placeholder="I'm interested in this property. Please provide more details..." />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={inquiryLoading} block size="large" icon={<WhatsAppOutlined />}>Send Inquiry</Button>
              </Form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">Please login to send an inquiry</Text><br />
                <Button type="primary" style={{ marginTop: 12 }} onClick={() => navigate('/auth/login')}>Login to Inquire</Button>
              </div>
            )}
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 13 }}>📞 For immediate assistance</Text><br />
              <Title level={4} style={{ color: '#1677ff', margin: '8px 0' }}>+91 79 XXXX XXXX</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Available Mon-Sat 9am-7pm</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
