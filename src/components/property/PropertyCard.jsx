import { useState } from 'react';
import { Tag, Typography, Tooltip, message } from 'antd';
import { HeartFilled, HeartOutlined, SwapOutlined, EyeOutlined, EnvironmentOutlined, ExpandOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import { toggleFavorite } from '../../api';
import { formatPrice, formatArea, getPropertyTypeColor, getPurposeColor } from '../../utils/helpers';

const { Text } = Typography;

const PURPOSE_COLORS = { Sale: '#10b981', Rent: '#6366f1' };
const PURPOSE_BG    = { Sale: 'rgba(16,185,129,0.12)', Rent: 'rgba(99,102,241,0.12)' };

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { isAuthenticated } = useAuth();
  const { addToCompare, isInCompare } = useCompare();
  const navigate = useNavigate();
  const [fav, setFav]           = useState(property.isFavorite);
  const [favLoading, setFavLoading] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const [favAnimating, setFavAnimating] = useState(false);

  const thumbnail = property.images?.find(i => i.isThumbnail)?.imagePath
    || property.images?.[0]?.imagePath
    || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400';

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { message.info('Please login to save favorites'); return; }
    setFavLoading(true);
    setFavAnimating(true);
    setTimeout(() => setFavAnimating(false), 500);
    try {
      const res = await toggleFavorite(property.id);
      setFav(res.data.isFavorite);
      onFavoriteToggle?.(property.id, res.data.isFavorite);
    } catch { message.error('Failed to update favorite'); }
    finally { setFavLoading(false); }
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    addToCompare(property);
  };

  return (
    <div
      className="property-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/properties/${property.slug}`)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 20px 60px rgba(99,102,241,0.18), 0 8px 25px rgba(0,0,0,0.1)'
          : 'var(--shadow-md)',
        border: `1px solid ${hovered ? 'rgba(99,102,241,0.2)' : 'rgba(0,0,0,0.06)'}`,
        cursor: 'pointer',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.3s ease',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 210, overflow: 'hidden', flexShrink: 0 }}>
        <img
          alt={property.title}
          src={thumbnail}
          className="property-card-img"
          style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          loading="lazy"
        />

        {/* Dark overlay on hover */}
        <div className="property-card-overlay" style={{ opacity: hovered ? 1 : 0 }} />

        {/* Gradient overlay always */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }} />

        {/* Top-left tags */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            background: PURPOSE_BG[property.purpose] || 'rgba(99,102,241,0.15)',
            color: PURPOSE_COLORS[property.purpose] || '#6366f1',
            border: `1px solid ${PURPOSE_COLORS[property.purpose] || '#6366f1'}44`,
            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
            backdropFilter: 'blur(8px)',
          }}>
            {property.purpose === 'Sale' ? '🏷️ For Sale' : '🔑 For Rent'}
          </span>
          <span style={{
            background: 'rgba(0,0,0,0.4)', color: '#fff',
            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
            backdropFilter: 'blur(8px)',
          }}>
            {property.propertyType}
          </span>
        </div>

        {/* Featured badge */}
        {property.isFeatured && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            color: '#fff', borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
          }}>
            ⭐ Featured
          </div>
        )}

        {/* Bottom action buttons — appear on hover */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          display: 'flex', gap: 6,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.25s ease',
        }}>
          <Tooltip title="Add to Compare">
            <button
              onClick={handleCompare}
              style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: isInCompare(property.id) ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.9)',
                color: isInCompare(property.id) ? '#fff' : '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!isInCompare(property.id)) e.currentTarget.style.background = 'rgba(99,102,241,0.9)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!isInCompare(property.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.color = '#374151'; }}
            >
              <SwapOutlined />
            </button>
          </Tooltip>
          <Tooltip title={fav ? 'Remove from Favorites' : 'Save Property'}>
            <button
              onClick={handleFav}
              disabled={favLoading}
              className={`heart-btn ${favAnimating ? 'favorited' : ''}`}
              style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: fav ? 'linear-gradient(135deg, #ef4444, #ec4899)' : 'rgba(255,255,255,0.9)',
                color: fav ? '#fff' : '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease', fontFamily: 'inherit',
              }}
            >
              {fav ? <HeartFilled /> : <HeartOutlined />}
            </button>
          </Tooltip>
        </div>

        {/* Price badge — bottom left of image */}
        <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
          <div className="price-badge">
            {formatPrice(property.price)}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Title */}
        <div style={{
          fontSize: 15, fontWeight: 700, lineHeight: 1.4,
          color: 'var(--text-primary)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {property.title}
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)', fontSize: 12 }}>
          <EnvironmentOutlined style={{ color: '#6366f1', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {property.address}, {property.city}
          </span>
        </div>

        {/* Area */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          📐 {formatArea(property.areaSqFt)}
        </div>

        {/* Bed/Bath/Park */}
        {(property.bedrooms || property.bathrooms || property.parking) && (
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', paddingTop: 4, borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 4 }}>
            {property.bedrooms  && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>🛏️ <strong>{property.bedrooms}</strong> Bed</span>}
            {property.bathrooms && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>🚿 <strong>{property.bathrooms}</strong> Bath</span>}
            {property.parking   && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>🚗 <strong>{property.parking}</strong> Park</span>}
          </div>
        )}

        {/* Views */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <EyeOutlined /> {property.viewCount} views
          </span>
        </div>
      </div>
    </div>
  );
}
