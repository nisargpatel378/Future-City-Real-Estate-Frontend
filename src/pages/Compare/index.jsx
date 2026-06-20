import { Typography, Button, Table, Tag, Empty, Space, Tooltip } from 'antd';
import { DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { formatPrice, formatArea, getPropertyTypeColor, getPurposeColor } from '../../utils/helpers';

const { Title, Text } = Typography;

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
      <Empty description="No properties to compare" style={{ padding: 60 }}>
        <Button type="primary" icon={<AppstoreOutlined />} onClick={() => navigate('/properties')}>Browse Properties</Button>
      </Empty>
    </div>
  );

  const fields = [
    { label: 'Image', render: p => <img src={p.images?.find(i=>i.isThumbnail)?.imagePath || p.images?.[0]?.imagePath} alt={p.title} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} /> },
    { label: 'Title', render: p => <Text strong style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate(`/properties/${p.slug}`)}>{p.title}</Text> },
    { label: 'Price', render: p => <Text style={{ fontWeight: 700, color: '#1677ff' }}>{formatPrice(p.price)}</Text> },
    { label: 'Purpose', render: p => <Tag color={getPurposeColor(p.purpose)}>{p.purpose}</Tag> },
    { label: 'Type', render: p => <Tag color={getPropertyTypeColor(p.propertyType)}>{p.propertyType}</Tag> },
    { label: 'Area', render: p => formatArea(p.areaSqFt) },
    { label: 'Bedrooms', render: p => p.bedrooms ? `${p.bedrooms} BHK` : '-' },
    { label: 'Bathrooms', render: p => p.bathrooms || '-' },
    { label: 'Parking', render: p => p.parking ? `${p.parking} spot(s)` : '-' },
    { label: 'City', render: p => p.city },
    { label: 'Amenities', render: p => p.amenities?.slice(0,4).join(', ') || '-' },
    { label: 'Action', render: p => (
      <Space>
        <Button type="primary" size="small" onClick={() => navigate(`/properties/${p.slug}`)}>View</Button>
        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeFromCompare(p.id)}>Remove</Button>
      </Space>
    ) }
  ];

  const dataSource = fields.map((f, i) => {
    const row = { key: i, field: f.label };
    compareList.forEach((p, j) => { row[`prop${j}`] = f.render(p); });
    return row;
  });

  const columns = [
    { title: 'Feature', dataIndex: 'field', key: 'field', fixed: 'left', width: 120, render: v => <Text strong>{v}</Text> },
    ...compareList.map((p, i) => ({ title: p.title.substring(0, 25) + '...', dataIndex: `prop${i}`, key: `prop${i}`, width: 200 }))
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><Title level={2} style={{ margin: 0 }}>?? Compare Properties</Title><Text type="secondary">{compareList.length} / 4 properties selected</Text></div>
        <Space>
          <Button onClick={() => navigate('/properties')}>Add More</Button>
          <Button danger icon={<DeleteOutlined />} onClick={clearCompare}>Clear All</Button>
        </Space>
      </div>
      <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ x: true }} bordered style={{ borderRadius: 12, overflow: 'hidden' }} />
    </div>
  );
}
