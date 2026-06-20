import { useState, useEffect } from 'react';
import { Row, Col, Typography, Empty, Spin, Button } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFavorites } from '../../api';
import PropertyCard from '../../components/property/PropertyCard';

const { Title, Text } = Typography;

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => { try { const r = await getFavorites(); setFavorites(r.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleFavoriteToggle = (id, isFav) => { if (!isFav) setFavorites(prev => prev.filter(p => p.id !== id)); };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <HeartFilled style={{ fontSize: 28, color: '#ff4d4f' }} />
        <div><Title level={2} style={{ margin: 0 }}>My Favorites</Title><Text type="secondary">{favorites.length} saved properties</Text></div>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div> :
        favorites.length === 0 ? (
          <Empty description="No saved properties yet" style={{ padding: 80 }}>
            <Button type="primary" onClick={() => navigate('/properties')}>Browse Properties</Button>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {favorites.map(p => <Col key={p.id} xs={24} sm={12} lg={8} xl={6}><PropertyCard property={p} onFavoriteToggle={handleFavoriteToggle} /></Col>)}
          </Row>
        )}
    </div>
  );
}
