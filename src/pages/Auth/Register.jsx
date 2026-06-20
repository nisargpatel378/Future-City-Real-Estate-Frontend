import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../api';

const { Title, Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await registerApi({ name: values.name, email: values.email, password: values.password, phone: values.phone });
      login({ id: res.data.id, name: res.data.name, email: res.data.email, role: res.data.role }, res.data.token);
      message.success('Account created successfully!');
      navigate('/');
    } catch (err) { message.error(err.response?.data || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 460, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>??</div>
          <Title level={3} style={{ margin: 0 }}>Create Account</Title>
          <Text type="secondary">Join Future City Real Estate</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" rules={[{ required: true }]}><Input prefix={<UserOutlined />} placeholder="Full name" size="large" /></Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} placeholder="Email address" size="large" /></Form.Item>
          <Form.Item name="phone"><Input prefix={<PhoneOutlined />} placeholder="Phone number (optional)" size="large" /></Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6 }]}><Input.Password prefix={<LockOutlined />} placeholder="Password (min 6 chars)" size="large" /></Form.Item>
          <Form.Item name="confirm" dependencies={['password']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject('Passwords do not match!'); } })]}><Input.Password prefix={<LockOutlined />} placeholder="Confirm password" size="large" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ borderRadius: 8, height: 48 }}>Create Account</Button>
        </Form>
        <Divider />
        <div style={{ textAlign: 'center' }}><Text>Already have an account? </Text><Link to="/auth/login">Sign in</Link></div>
      </Card>
    </div>
  );
}
