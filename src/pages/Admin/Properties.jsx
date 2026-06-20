import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Typography, Input, Popconfirm, message, Switch, Modal, Form, Select, InputNumber, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { searchProperties, createProperty, updateProperty, deleteProperty, toggleStatus, toggleFeatured, getAmenities, addPropertyImage } from '../../api';
import { formatPrice } from '../../utils/helpers';

const { Title } = Typography;

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = async (p = page, kw = keyword) => {
    setLoading(true);
    try { const r = await searchProperties({ keyword: kw || undefined, page: p, pageSize: 15, sortBy: 'createdDate', sortOrder: 'desc' }); setProperties(r.data.items); setTotal(r.data.totalCount); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); getAmenities().then(r => setAmenities(r.data)); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (prop) => { setEditing(prop); form.setFieldsValue({ ...prop, amenityIds: [] }); setModalOpen(true); };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editing) { await updateProperty(editing.id, { ...values, isActive: editing.isActive }); message.success('Property updated!'); }
      else { await createProperty(values); message.success('Property created!'); }
      setModalOpen(false); load();
    } catch { message.error('Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => { await deleteProperty(id); message.success('Deleted'); load(); };
  const handleToggleStatus = async (id) => { await toggleStatus(id); load(); };
  const handleToggleFeatured = async (id) => { await toggleFeatured(id); load(); };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', width: 220, render: (t, r) => <><div style={{ fontWeight: 600, fontSize: 13 }}>{t.substring(0,35)}{t.length>35?'...':''}</div><div style={{ fontSize: 11, color: '#888' }}>{r.city} • {r.propertyType}</div></> },
    { title: 'Price', dataIndex: 'price', key: 'price', render: p => <span style={{ fontWeight: 700, color: '#1677ff' }}>{formatPrice(p)}</span> },
    { title: 'Purpose', dataIndex: 'purpose', key: 'purpose', render: v => <Tag color={v==='Sale'?'red':'blue'}>{v}</Tag> },
    { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (v, r) => <Switch checked={v} size="small" onChange={() => handleToggleStatus(r.id)} /> },
    { title: 'Featured', dataIndex: 'isFeatured', key: 'isFeatured', render: (v, r) => <Switch checked={v} size="small" onChange={() => handleToggleFeatured(r.id)} checkedChildren="?" /> },
    { title: 'Views', dataIndex: 'viewCount', key: 'viewCount' },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Edit</Button>
        <Popconfirm title="Delete this property?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
          <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  const TYPES = ['Residential','Commercial','Apartment','Villa','Penthouse','Office','Shop','Land'];

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <Title level={3} style={{ margin: 0 }}>?? Manage Properties</Title>
        <Space>
          <Input.Search placeholder="Search..." value={keyword} onChange={e => setKeyword(e.target.value)} onSearch={kw => { setPage(1); load(1, kw); }} allowClear style={{ width: 240 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Property</Button>
        </Space>
      </div>
      <Table dataSource={properties} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, total, pageSize: 15, onChange: p => { setPage(p); load(p); } }} scroll={{ x: true }} style={{ borderRadius: 12 }} />

      <Modal title={editing ? 'Edit Property' : 'Create Property'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={760}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
          <Form.Item name="title" label="Title" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="description" label="Description" rules={[{required:true}]}><Input.TextArea rows={3} /></Form.Item>
          <Space.Compact style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
            <Form.Item name="propertyType" label="Type" rules={[{required:true}]} style={{ flex: 1 }}>
              <Select options={TYPES.map(t=>({value:t,label:t}))} />
            </Form.Item>
            <Form.Item name="purpose" label="Purpose" rules={[{required:true}]} style={{ flex: 1 }}>
              <Select options={[{value:'Sale',label:'Sale'},{value:'Rent',label:'Rent'}]} />
            </Form.Item>
          </Space.Compact>
          <Space style={{ display: 'flex', gap: 12, flexWrap: 'wrap', width: '100%' }}>
            <Form.Item name="price" label="Price (?)" rules={[{required:true}]} style={{ flex: 1 }}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
            <Form.Item name="areaSqFt" label="Area (sq.ft)" rules={[{required:true}]} style={{ flex: 1 }}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </Space>
          <Space style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Form.Item name="bedrooms" label="Bedrooms" style={{ flex: 1 }}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
            <Form.Item name="bathrooms" label="Bathrooms" style={{ flex: 1 }}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
            <Form.Item name="parking" label="Parking" style={{ flex: 1 }}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </Space>
          <Form.Item name="address" label="Address" rules={[{required:true}]}><Input /></Form.Item>
          <Space style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Form.Item name="city" label="City" rules={[{required:true}]} style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="state" label="State" initialValue="Gujarat" style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="pincode" label="Pincode" style={{ flex: 1 }}><Input /></Form.Item>
          </Space>
          <Form.Item name="googleMapsUrl" label="Google Maps URL (lat/lng auto-extracted)"><Input placeholder="https://maps.google.com/?q=23.0332,72.5052" /></Form.Item>
          <Form.Item name="amenityIds" label="Amenities"><Select mode="multiple" placeholder="Select amenities" options={amenities.map(a=>({value:a.id,label:`${a.icon} ${a.name}`}))} /></Form.Item>
          <Form.Item name="isFeatured" label="Featured" valuePropName="checked"><Switch /></Form.Item>
          <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>Save Property</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
