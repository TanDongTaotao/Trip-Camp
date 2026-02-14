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

  useEffect(() => {
    if (!id) return
    let active = true
    const fetchHotelDetail = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/hotels/${id}`)
        if (active) {
          setHotel(response.hotel || null)
          message.success('获取酒店详情成功')
        }
      } catch (error) {
        if (active) {
          message.error('获取酒店详情失败：' + (error.response?.data?.message || error.message))
          setHotel(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    fetchHotelDetail()
    return () => {
      active = false
    }
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
        <Title level={3}>
          {hotel.nameCn}
          {hotel.nameEn ? ` (${hotel.nameEn})` : ''}
        </Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="城市">{hotel.city}</Descriptions.Item>
          <Descriptions.Item label="地址">{hotel.address}</Descriptions.Item>
          <Descriptions.Item label="星级">{hotel.star}星</Descriptions.Item>
          <Descriptions.Item label="类型">{hotel.type}</Descriptions.Item>
          <Descriptions.Item label="起步价">¥{hotel.minPrice}/晚</Descriptions.Item>
          <Descriptions.Item label="开业时间">{hotel.openTime}</Descriptions.Item>
          <Descriptions.Item label="标签">
            {Array.isArray(hotel.tags) && hotel.tags.length > 0 ? hotel.tags.join(' / ') : '无'}
          </Descriptions.Item>
          <Descriptions.Item label="房型数量">
            {Array.isArray(hotel.roomTypes) ? hotel.roomTypes.length : 0}
          </Descriptions.Item>
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
                alt={`${hotel.nameCn} - 图片 ${index + 1}`}
                width={200}
              />
            ))}
          </div>
        </Card>
      )}

      {Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>房型列表</Title>
          <Descriptions bordered column={1}>
            {hotel.roomTypes.map((room, index) => (
              <Descriptions.Item key={index} label={`${room.name} - ¥${room.price}/晚`}>
                {Array.isArray(room.amenities) && room.amenities.length > 0 ? room.amenities.join(' / ') : '无'}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}
    </div>
  )
}

export default HotelDetailPage
