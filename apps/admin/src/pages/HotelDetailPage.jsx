/*
  酒店详情预览页面（阶段 2 可选加分项）：
  - 作为管理端的酒店详情预览功能
  - 只读页面，用于快速验证后端 hotels 接口
  - 不做写操作，只展示酒店详情数据
*/
import { useState, useEffect } from 'react'
import { Typography, Card, message, Button, Descriptions, Image } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'

const { Title, Paragraph } = Typography

const HotelDetailPage = () => {
  const [loading, setLoading] = useState(false)
  const [hotel, setHotel] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()

  // 获取酒店详情
  const fetchHotelDetail = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const response = await api.get(`/hotels/${id}`)
      setHotel(response.data || response)
      message.success('获取酒店详情成功')
    } catch (error) {
      message.error('获取酒店详情失败：' + (error.response?.data?.message || error.message))
      setHotel(null)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取酒店详情
  useEffect(() => {
    fetchHotelDetail()
  }, [id])

  // 返回酒店列表
  const handleBack = () => {
    navigate('/hotel/list')
  }

  if (loading) {
    return (
      <div>
        <Title level={2}>酒店详情预览</Title>
        <Card>
          <Paragraph>加载中...</Paragraph>
        </Card>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div>
        <Title level={2}>酒店详情预览</Title>
        <Card>
          <Paragraph>酒店不存在或获取失败</Paragraph>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>酒店详情预览</Title>
      
      {/* 操作栏 */}
      <Button 
        style={{ marginBottom: 24 }} 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
      >
        返回列表
      </Button>
      
      {/* 酒店基本信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>{hotel.name}</Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="地址">{hotel.address}</Descriptions.Item>
          <Descriptions.Item label="价格">¥{hotel.price}/晚</Descriptions.Item>
          <Descriptions.Item label="状态">
            {{
              pending: '待审核',
              published: '已发布',
              offline: '已下线',
            }[hotel.status] || hotel.status}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {hotel.createdAt ? new Date(hotel.createdAt).toLocaleString() : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {hotel.updatedAt ? new Date(hotel.updatedAt).toLocaleString() : '未知'}
          </Descriptions.Item>
          <Descriptions.Item label="商户ID">{hotel.merchantId}</Descriptions.Item>
        </Descriptions>
      </Card>
      
      {/* 酒店图片 */}
      {hotel.images && hotel.images.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>酒店图片</Title>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {hotel.images.map((image, index) => (
              <Image 
                key={index} 
                src={image} 
                alt={`${hotel.name} - 图片 ${index + 1}`} 
                width={200} 
              />
            ))}
          </div>
        </Card>
      )}
      
      {/* 酒店描述 */}
      {hotel.description && (
        <Card>
          <Title level={4}>酒店描述</Title>
          <Paragraph>{hotel.description}</Paragraph>
        </Card>
      )}
    </div>
  )
}

export default HotelDetailPage