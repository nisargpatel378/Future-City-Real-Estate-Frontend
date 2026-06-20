import { Card, Tag, Typography, Space, Button, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined, SwapOutlined, EyeOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { toggleFavorite } from '../../api';
import { formatPrice, formatArea, getPropertyTypeColor, getPurposeColor } from '../../utils/helpers';
import { useState } from 'react';
import { message } from 'antd';

const { Meta } = Card;
const { Text } = Typography;

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { isAuthenticated } = useAuth();
  const { addToCompare, isInCompare } = useCompare();
  const navigate = useNavigate();
  const [fav, setFav] = useState(property.isFavorite);
  const [favLoading, setFavLoading] = useState(false);

  const thumbnail = property.images?.find(i => i.isThumbnail)?.imagePath || property.images?.[0]?.imagePath || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400';

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { message.info('Please login to save favorites'); return; }
    setFavLoading(true);
    try {
      const res = await toggleFavorite(property.id);
      setFav(res.data.isFavorite);
      onFavoriteToggle?.(property.id, res.data.isFavorite);
    } catch { message.error('Failed to update favorite'); }
    finally { setFavLoading(false); }
  };

  return (
    <Card
      hoverable
      style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
      cover={
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img alt={property.title} src={thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Tag color={getPurposeColor(property.purpose)}>{property.purpose}</Tag>
            <Tag color={getPropertyTypeColor(property.propertyType)}>{property.propertyType}</Tag>
          </div>
          {property.isFeatured && <Tag color="gold" style={{ position: 'absolute', top: 12, right: 12 }}>⭐ Featured</Tag>}
          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
            <Tooltip title="Add to Compare"><Button size="small" shape="circle" icon={<SwapOutlined />} type={isInCompare(property.id) ? 'primary' : 'default'} onClick={e => { e.stopPropagation(); addToCompare(property); }} /></Tooltip>
            <Tooltip title={fav ? 'Remove from Favorites' : 'Add to Favorites'}><Button size="small" shape="circle" loading={favLoading} icon={fav ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} onClick={handleFav} /></Tooltip>
          </div>
        </div>
      }
      onClick={() => navigate(`/properties/${property.slug}`)}
    >
      <Meta
        title={<Text ellipsis style={{ fontSize: 15, fontWeight: 600 }}>{property.title}</Text>}
        description={
          <>
            <Space style={{ marginBottom: 8 }}><EnvironmentOutlined /><Text type="secondary" style={{ fontSize: 12 }}>{property.address}, {property.city}</Text></Space>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: 700, color: '#1677ff' }}>{formatPrice(property.price)}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatArea(property.areaSqFt)}</Text>
            </div>
            {property.bedrooms && (
              <Space style={{ marginTop: 8, fontSize: 12 }} size="middle">
                {property.bedrooms && <span>🛏️ {property.bedrooms} Bed</span>}
                {property.bathrooms && <span>🚿 {property.bathrooms} Bath</span>}
                {property.parking && <span>🚗 {property.parking} Park</span>}
              </Space>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}><EyeOutlined /> {property.viewCount} views</Text>
            </div>
          </>
        }
      />
    </Card>
  );
}
