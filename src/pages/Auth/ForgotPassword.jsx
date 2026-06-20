import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api';

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.data.success) {
        setToken('Token generated — check server logs or use the reset page with this token');
        message.success('Password reset initiated');
      } else { message.error('Email not found'); }
    } catch { message.error('Failed to process request'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 420, borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>??</div>
          <Title level={3}>Forgot Password</Title>
          <Text type="secondary">Enter your email to reset your password</Text>
        </div>
        {token && <Alert type="info" message={token} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}><Input prefix={<MailOutlined />} placeholder="Email address" size="large" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">Send Reset Link</Button>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}><Link to="/auth/login">Back to Login</Link></div>
      </Card>
    </div>
  );
}
