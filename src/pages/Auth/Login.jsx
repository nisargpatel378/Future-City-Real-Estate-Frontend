import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../api';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await loginApi(values);
      login({ id: res.data.id, name: res.data.name, email: res.data.email, role: res.data.role }, res.data.token);
      message.success(`Welcome back, ${res.data.name}!`);
      navigate(res.data.role === 'Admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      message.error(err.response?.data || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>??</div>
          <Title level={3} style={{ margin: 0 }}>Welcome Back</Title>
          <Text type="secondary">Sign in to your Future City account</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} placeholder="Email address" size="large" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}><Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" /></Form.Item>
          <div style={{ textAlign: 'right', marginBottom: 16 }}><Link to="/auth/forgot-password">Forgot password?</Link></div>
          <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ borderRadius: 8, height: 48 }}>Sign In</Button>
        </Form>
        <Divider />
        <div style={{ textAlign: 'center' }}><Text>Don't have an account? </Text><Link to="/auth/register">Register now</Link></div>
        <div style={{ marginTop: 16, padding: 12, background: '#f6f8ff', borderRadius: 8, fontSize: 12 }}>
          <strong>Demo Credentials:</strong><br />Admin: admin@futurecity.com / Admin@123<br />User: user@demo.com / User@123
        </div>
      </Card>
    </div>
  );
}
