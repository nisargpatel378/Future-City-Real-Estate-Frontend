import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, message } from 'antd';
import { MailOutlined, PhoneOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { submitContact } from '../../api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try { await submitContact(values); message.success('Message sent! We will get back to you soon.'); form.resetFields(); }
    catch { message.error('Failed to send message'); } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2}>?? Contact Us</Title>
        <Text type="secondary">Get in touch with our real estate experts</Text>
      </div>
      <Row gutter={[40, 40]}>
        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 16, height: '100%' }}>
            <Title level={4}>Our Office</Title>
            <div style={{ marginBottom: 24 }}>
              {[{icon:<EnvironmentOutlined />, label:'Address',val:'Prahlad Nagar, Ahmedabad, Gujarat 380015'},{icon:<PhoneOutlined />, label:'Phone',val:'+91 79 XXXX XXXX'},{icon:<MailOutlined />, label:'Email',val:'info@futurecity.in'}].map((item,i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 20, color: '#1677ff', marginTop: 2 }}>{item.icon}</div>
                  <div><Text strong>{item.label}</Text><br /><Text type="secondary">{item.val}</Text></div>
                </div>
              ))}
            </div>
            <iframe src="https://maps.google.com/maps?q=Prahlad+Nagar+Ahmedabad&output=embed" width="100%" height="200" style={{ border: 0, borderRadius: 8 }} title="Office Location" />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card style={{ borderRadius: 16 }}>
            <Title level={4}>Send a Message</Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item name="name" label="Full Name" rules={[{required:true}]}><Input prefix={<UserOutlined />} placeholder="Your full name" size="large" /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item name="email" label="Email" rules={[{required:true,type:'email'}]}><Input prefix={<MailOutlined />} placeholder="Your email" size="large" /></Form.Item></Col>
              </Row>
              <Form.Item name="phone" label="Phone"><Input prefix={<PhoneOutlined />} placeholder="Your phone number" size="large" /></Form.Item>
              <Form.Item name="subject" label="Subject" rules={[{required:true}]}><Input placeholder="What is this about?" size="large" /></Form.Item>
              <Form.Item name="message" label="Message" rules={[{required:true}]}><TextArea rows={5} placeholder="Tell us how we can help you..." /></Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: 48, borderRadius: 8 }}>Send Message</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
