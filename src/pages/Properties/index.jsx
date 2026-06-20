import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Form, Input, Select, Slider, Button, Typography, Pagination, Empty, Spin, Collapse, InputNumber, Space } from 'antd';
import { FilterOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';
import PropertyCard from '../../components/property/PropertyCard';
import { searchProperties } from '../../api';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CITIES = ['Prahlad Nagar','SG Highway','Bopal','South Bopal','Satellite','Bodakdev','Thaltej','Science City','Gota','Chandkheda','Navrangpura','Vastrapur','Nikol','Maninagar'];
const TYPES = ['Residential','Commercial','Apartment','Villa','Penthouse','Office','Shop','Land'];

export default function PropertiesPage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();

  const buildFilters = useCallback(() => {
    const vals = form.getFieldsValue();
    return {
      keyword: vals.keyword || searchParams.get('keyword') || undefined,
      city: vals.city || searchParams.get('city') || undefined,
      propertyType: vals.propertyType || searchParams.get('propertyType') || undefined,
      purpose: vals.purpose || searchParams.get('purpose') || undefined,
      minPrice: vals.minPrice || undefined,
      maxPrice: vals.maxPrice || undefined,
      minArea: vals.minArea || undefined,
      maxArea: vals.maxArea || undefined,
      bedrooms: vals.bedrooms || undefined,
      bathrooms: vals.bathrooms || undefined,
      sortBy: vals.sortBy || 'createdDate',
      sortOrder: vals.sortOrder || 'desc',
      page, pageSize: 12
    };
  }, [form, page, searchParams]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchProperties(buildFilters());
      setProperties(res.data.items);
      setTotal(res.data.totalCount);
    } catch { } finally { setLoading(false); }
  }, [buildFilters]);

  useEffect(() => {
    if (searchParams.get('keyword')) form.setFieldValue('keyword', searchParams.get('keyword'));
    if (searchParams.get('propertyType')) form.setFieldValue('propertyType', searchParams.get('propertyType'));
    if (searchParams.get('purpose')) form.setFieldValue('purpose', searchParams.get('purpose'));
    fetchProperties();
  }, [page]);

  const handleSearch = () => { setPage(1); fetchProperties(); };
  const handleReset = () => { form.resetFields(); setPage(1); fetchProperties(); };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>🏠 Properties in Ahmedabad</Title>
        <Text type="secondary">{total} properties found</Text>
      </div>
      <Row gutter={[24, 24]}>
        {/* Sidebar Filters */}
        <Col xs={24} lg={6}>
          <Card style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text strong><FilterOutlined /> Filters</Text>
              <Button size="small" icon={<ClearOutlined />} onClick={handleReset}>Reset</Button>
            </div>
            <Form form={form} layout="vertical" onFinish={handleSearch}>
              <Form.Item name="keyword" label="Keyword"><Input prefix={<SearchOutlined />} placeholder="Search..." /></Form.Item>
              <Form.Item name="city" label="City"><Select allowClear placeholder="Select city" options={CITIES.map(c => ({value:c,label:c}))} /></Form.Item>
              <Form.Item name="purpose" label="Purpose"><Select allowClear placeholder="Sale / Rent" options={[{value:'Sale',label:'For Sale'},{value:'Rent',label:'For Rent'}]} /></Form.Item>
              <Form.Item name="propertyType" label="Property Type"><Select allowClear placeholder="Select type" options={TYPES.map(t => ({value:t,label:t}))} /></Form.Item>
              <Form.Item label="Price Range">
                <Space.Compact>
                  <Form.Item name="minPrice" noStyle><InputNumber style={{ width: '50%' }} placeholder="Min ₹" formatter={v => v ? `₹${v}` : ''} parser={v => v?.replace('₹','')} /></Form.Item>
                  <Form.Item name="maxPrice" noStyle><InputNumber style={{ width: '50%' }} placeholder="Max ₹" formatter={v => v ? `₹${v}` : ''} parser={v => v?.replace('₹','')} /></Form.Item>
                </Space.Compact>
              </Form.Item>
              <Form.Item label="Area (sq.ft)">
                <Space.Compact>
                  <Form.Item name="minArea" noStyle><InputNumber style={{ width: '50%' }} placeholder="Min" /></Form.Item>
                  <Form.Item name="maxArea" noStyle><InputNumber style={{ width: '50%' }} placeholder="Max" /></Form.Item>
                </Space.Compact>
              </Form.Item>
              <Form.Item name="bedrooms" label="Bedrooms"><Select allowClear placeholder="Any" options={[1,2,3,4,5].map(n => ({value:n,label:`${n}+`}))} /></Form.Item>
              <Form.Item name="bathrooms" label="Bathrooms"><Select allowClear placeholder="Any" options={[1,2,3,4].map(n => ({value:n,label:`${n}+`}))} /></Form.Item>
              <Form.Item name="sortBy" label="Sort By"><Select defaultValue="createdDate" options={[{value:'createdDate',label:'Newest'},{value:'price',label:'Price'},{value:'area',label:'Area'},{value:'views',label:'Most Viewed'}]} /></Form.Item>
              <Form.Item name="sortOrder" label="Order"><Select defaultValue="desc" options={[{value:'desc',label:'Descending'},{value:'asc',label:'Ascending'}]} /></Form.Item>
              <Button type="primary" htmlType="submit" block icon={<SearchOutlined />}>Apply Filters</Button>
            </Form>
          </Card>
        </Col>
        {/* Results */}
        <Col xs={24} lg={18}>
          {loading ? <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div> :
            properties.length === 0 ? <Empty description="No properties found. Try adjusting filters." style={{ padding: 80 }} /> :
            <>
              <Row gutter={[20, 20]}>
                {properties.map(p => <Col key={p.id} xs={24} sm={12} xl={8}><PropertyCard property={p} /></Col>)}
              </Row>
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Pagination current={page} total={total} pageSize={12} onChange={setPage} showSizeChanger={false} showTotal={t => `Total ${t} properties`} />
              </div>
            </>
          }
        </Col>
      </Row>
    </div>
  );
}
