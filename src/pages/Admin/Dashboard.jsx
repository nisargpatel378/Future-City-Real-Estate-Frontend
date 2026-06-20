import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import { HomeOutlined, CheckCircleOutlined, UserOutlined, MessageOutlined, StarOutlined, EyeOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { getDashboardStats } from '../../api';

const { Title } = Typography;
const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#fa8c16', '#eb2f96'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDashboardStats().then(r => setStats(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 120 }}><Spin size="large" /></div>;
  if (!stats) return null;

  const cards = [
    { title: 'Total Properties', value: stats.totalProperties, icon: <HomeOutlined />, color: '#1677ff' },
    { title: 'Active Properties', value: stats.activeProperties, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: 'Total Users', value: stats.totalUsers, icon: <UserOutlined />, color: '#722ed1' },
    { title: 'Total Inquiries', value: stats.totalInquiries, icon: <MessageOutlined />, color: '#fa8c16' },
    { title: 'Featured', value: stats.featuredProperties, icon: <StarOutlined />, color: '#faad14' },
    { title: 'Total Views', value: stats.totalViews, icon: <EyeOutlined />, color: '#13c2c2' },
  ];

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 32 }}>?? Admin Dashboard</Title>
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {cards.map((c, i) => (
          <Col key={i} xs={12} sm={8} xl={4}>
            <Card style={{ borderRadius: 12, borderTop: `3px solid ${c.color}` }}>
              <Statistic title={c.title} value={c.value} prefix={<span style={{ color: c.color }}>{c.icon}</span>} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Monthly Inquiries (Last 6 months)" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.monthlyInquiries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#1677ff" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Property Types Distribution" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={stats.propertyTypeDistribution} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({label, percent}) => `${label} ${(percent*100).toFixed(0)}%`}>{stats.propertyTypeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Monthly Property Views" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyViews}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="value" name="Views" stroke="#1677ff" strokeWidth={2} dot={{ r: 4 }} /></LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
