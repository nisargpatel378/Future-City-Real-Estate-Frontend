import { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Card, Typography, Avatar, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../api';

const { Title, Text } = Typography;

export default function Profile() {
  const { user, login, token } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  useEffect(() => { profileForm.setFieldsValue({ name: user?.name, phone: user?.phone }); }, [user]);

  const onProfileSave = async (values) => {
    setProfileLoading(true);
    try {
      const res = await updateProfile(values);
      login({ ...user, name: res.data.name, phone: res.data.phone }, token);
      message.success('Profile updated!');
    } catch { message.error('Failed to update profile'); } finally { setProfileLoading(false); }
  };

  const onPasswordChange = async (values) => {
    setPwdLoading(true);
    try { await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }); message.success('Password changed!'); pwdForm.resetFields(); }
    catch (err) { message.error(err.response?.data || 'Failed to change password'); } finally { setPwdLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: '0 16px' }}>
      <Card style={{ borderRadius: 16, marginBottom: 24, textAlign: 'center', padding: 32 }}>
        <Avatar size={80} style={{ background: '#1677ff', fontSize: 32 }} icon={<UserOutlined />} />
        <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>{user?.name}</Title>
        <Text type="secondary">{user?.email}</Text>
        <div style={{ marginTop: 8 }}><Text style={{ background: '#1677ff22', color: '#1677ff', padding: '2px 12px', borderRadius: 12, fontSize: 13 }}>{user?.role}</Text></div>
      </Card>
      <Card style={{ borderRadius: 16 }}>
        <Tabs items={[
          {
            key: 'profile', label: '?? Edit Profile',
            children: (
              <Form form={profileForm} layout="vertical" onFinish={onProfileSave}>
                <Form.Item name="name" label="Full Name" rules={[{required:true}]}><Input prefix={<UserOutlined />} size="large" /></Form.Item>
                <Form.Item name="phone" label="Phone Number"><Input prefix={<PhoneOutlined />} size="large" /></Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading} size="large">Save Changes</Button>
              </Form>
            )
          },
          {
            key: 'password', label: '?? Change Password',
            children: (
              <Form form={pwdForm} layout="vertical" onFinish={onPasswordChange}>
                <Form.Item name="currentPassword" label="Current Password" rules={[{required:true}]}><Input.Password prefix={<LockOutlined />} size="large" /></Form.Item>
                <Form.Item name="newPassword" label="New Password" rules={[{required:true, min:6}]}><Input.Password prefix={<LockOutlined />} size="large" /></Form.Item>
                <Form.Item name="confirm" dependencies={['newPassword']} label="Confirm Password" rules={[{required:true}, ({getFieldValue}) => ({validator(_, value){ return !value || getFieldValue('newPassword')===value ? Promise.resolve() : Promise.reject('Passwords do not match!'); }})]}>
                  <Input.Password prefix={<LockOutlined />} size="large" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={pwdLoading} size="large" danger>Change Password</Button>
              </Form>
            )
          }
        ]} />
      </Card>
    </div>
  );
}
