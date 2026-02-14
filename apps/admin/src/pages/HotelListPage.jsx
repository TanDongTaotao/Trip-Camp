/*
  酒店列表预览页面（阶段 2 可选加分项）：
  - 作为管理端的酒店列表预览功能
  - 只读页面，用于快速验证后端 hotels 接口
  - 不做写操作，只展示酒店列表数据
*/
import { useState, useEffect } from 'react'
import { Typography, Card, Table, message, Button, Space } from 'antd'
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const { Title, Paragraph } = Typography

const HotelListPage = () => {
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState([])
  const navigate = useNavigate()

  // 获取酒店列表
  const fetchHotels = async () => {
    setLoading(true)
    try {
      const response = await api.get('/hotels')
      setHotels(response.list || [])
      message.success('获取酒店列表成功')
    } catch (error) {
      message.error('获取酒店列表失败：' + (error.response?.data?.message || error.message))
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取酒店列表
  useEffect(() => {
    fetchHotels()
  }, [])

  // 查看酒店详情
  const handleViewDetail = (hotel) => {
    navigate(`/hotel/detail/${hotel.id}`)
  }

  // 表格列配置
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'nameCn',
      key: 'nameCn',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '价格',
      dataIndex: 'minPrice',
      key: 'minPrice',
      render: (price) => `¥${price}/晚`,
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      render: (star) => `${star}星`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Title level={2}>酒店列表预览</Title>
      
      {/* 页面说明 */}
      <Card style={{ marginBottom: 24 }}>
        <Paragraph>
          这是酒店列表预览页面，用于快速验证后端 hotels 接口。
        </Paragraph>
        <Paragraph>
          本页面为只读页面，不做写操作，只展示酒店列表数据。
        </Paragraph>
      </Card>
      
      {/* 操作栏 */}
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchHotels}
          loading={loading}
        >
          刷新列表
        </Button>
      </Space>
      
      {/* 酒店列表 */}
      <Card>
        <Table 
          dataSource={hotels} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>
    </div>
  )
}

export default HotelListPage
