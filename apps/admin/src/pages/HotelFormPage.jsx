/*
  酒店录入/编辑表单页面（阶段 3）：
  - 商户角色的核心功能页面
  - 支持酒店信息的录入和编辑
  - 包含房型管理功能
*/
import { useState, useEffect, useCallback } from 'react'
import { Typography, Form, Input, Select, InputNumber, Card, Button, Space, message } from 'antd'
import { PlusOutlined, MinusOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { useNavigate, useParams } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const HotelFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  // 表单状态
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // 房型状态
  const [roomTypes, setRoomTypes] = useState([])

  // 加载酒店数据
  const loadHotelData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(`/merchant/hotels/${id}`)
      const hotel = response.hotel
      if (!hotel) {
        message.error('酒店不存在或无权限访问')
        navigate('/merchant/hotels', { replace: true })
        return
      }
      const { roomTypes: hotelRoomTypes, ...rest } = hotel
      form.setFieldsValue(rest)
      setRoomTypes(Array.isArray(hotelRoomTypes) ? hotelRoomTypes : [])
    } catch (error) {
      message.error('加载酒店数据失败')
      console.error('加载酒店数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [form, id, navigate])

  // 初始化表单
  useEffect(() => {
    if (isEdit) {
      loadHotelData()
    }
  }, [isEdit, loadHotelData])

  // 处理房型变化
  const handleRoomTypeChange = (index, field, value) => {
    const newRoomTypes = [...roomTypes]
    newRoomTypes[index] = { ...newRoomTypes[index], [field]: value }
    setRoomTypes(newRoomTypes)
  }

  // 添加房型
  const addRoomType = () => {
    setRoomTypes([...roomTypes, { name: '', price: 0, images: [], amenities: [] }])
  }

  // 删除房型
  const removeRoomType = (index) => {
    const newRoomTypes = [...roomTypes]
    newRoomTypes.splice(index, 1)
    setRoomTypes(newRoomTypes)
  }

  // 提交表单
  const handleSubmit = async (values) => {
    // 验证房型
    if (roomTypes.length === 0) {
      message.error('至少需要添加一个房型')
      return
    }

    for (const room of roomTypes) {
      if (!room.name) {
        message.error('房型名称不能为空')
        return
      }
      if (room.price < 0) {
        message.error('房型价格不能为负数')
        return
      }
    }

    setSubmitLoading(true)
    try {
      const hotelData = {
        ...values,
        roomTypes,
      }

      if (isEdit) {
        // 编辑酒店
        await api.put(`/merchant/hotels/${id}`, hotelData)
        message.success('酒店编辑成功')
      } else {
        // 新增酒店
        await api.post('/merchant/hotels', hotelData)
        message.success('酒店录入成功')
      }

      navigate('/merchant')
    } catch (error) {
      message.error(isEdit ? '酒店编辑失败' : '酒店录入失败')
      console.error('提交表单失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  // 提交审核
  const handleSubmitAudit = async (values) => {
    // 验证房型
    if (roomTypes.length === 0) {
      message.error('至少需要添加一个房型')
      return
    }

    for (const room of roomTypes) {
      if (!room.name) {
        message.error('房型名称不能为空')
        return
      }
      if (room.price < 0) {
        message.error('房型价格不能为负数')
        return
      }
    }

    setSubmitLoading(true)
    try {
      const hotelData = {
        ...values,
        roomTypes,
      }

      if (isEdit) {
        // 先更新酒店
        await api.put(`/merchant/hotels/${id}`, hotelData)
        // 再提交审核
        await api.post(`/merchant/hotels/${id}/submit`)
        message.success('提交审核成功')
      } else {
        // 先新增酒店
        const response = await api.post('/merchant/hotels', hotelData)
        // 再提交审核
        await api.post(`/merchant/hotels/${response.hotel.id}/submit`)
        message.success('酒店录入并提交审核成功')
      }

      navigate('/merchant')
    } catch (error) {
      message.error('提交审核失败')
      console.error('提交审核失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/merchant')}>
          返回商户管理
        </Button>
        <Title level={2}>{isEdit ? '编辑酒店' : '录入酒店'}</Title>
      </Space>

      {loading ? (
        <div>加载中...</div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            star: 3,
            roomTypes: []
          }}
        >
          {/* 基础信息 */}
          <Card title="基础信息" style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space size="middle" style={{ width: '100%' }}>
                <Form.Item
                  label="酒店中文名称"
                  name="nameCn"
                  rules={[{ required: true, message: '请输入酒店中文名称' }]}
                  style={{ flex: 1, marginRight: 16 }}
                >
                  <Input placeholder="请输入酒店中文名称" />
                </Form.Item>
                <Form.Item
                  label="酒店英文名称"
                  name="nameEn"
                  style={{ flex: 1 }}
                >
                  <Input placeholder="请输入酒店英文名称" />
                </Form.Item>
              </Space>

              <Form.Item
                label="酒店地址"
                name="address"
                rules={[{ required: true, message: '请输入酒店地址' }]}
              >
                <Input placeholder="请输入酒店详细地址" />
              </Form.Item>

              <Form.Item
                label="城市"
                name="city"
                rules={[{ required: true, message: '请输入城市' }]}
              >
                <Input placeholder="请输入城市" />
              </Form.Item>

              <Space size="middle" style={{ width: '100%' }}>
                <Form.Item
                  label="酒店星级"
                  name="star"
                  rules={[{ required: true, message: '请选择酒店星级' }]}
                  style={{ flex: 1, marginRight: 16 }}
                >
                  <Select placeholder="请选择酒店星级">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Option key={star} value={star}>{star}星</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="酒店类型"
                  name="type"
                  rules={[{ required: true, message: '请输入酒店类型' }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="例如：商务酒店、度假酒店、民宿等" />
                </Form.Item>
              </Space>

              <Form.Item
                label="开业时间"
                name="openTime"
                rules={[{ required: true, message: '请输入开业时间' }]}
              >
                <Input placeholder="请输入开业时间，例如：2020-01-01" />
              </Form.Item>

              <Form.Item
                label="酒店简介"
                name="bannerText"
              >
                <TextArea rows={4} placeholder="请输入酒店简介" />
              </Form.Item>
            </Space>
          </Card>

          {/* 房型管理 */}
          <Card title="房型管理" style={{ marginBottom: 24 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addRoomType}
              style={{ marginBottom: 16 }}
            >
              添加房型
            </Button>

            {roomTypes.length === 0 ? (
              <Paragraph type="secondary">请添加至少一个房型</Paragraph>
            ) : (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {roomTypes.map((room, index) => (
                  <Card key={index} style={{ borderLeft: '4px solid #1890ff' }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Space size="middle" style={{ width: '100%' }}>
                        <Form.Item
                          label="房型名称"
                          fieldKey={`roomTypes[${index}].name`}
                          fieldValue={room.name}
                          rules={[{ required: true, message: '请输入房型名称' }]}
                          style={{ flex: 1, marginRight: 16 }}
                        >
                          <Input
                            placeholder="请输入房型名称"
                            value={room.name}
                            onChange={(e) => handleRoomTypeChange(index, 'name', e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item
                          label="价格"
                          fieldKey={`roomTypes[${index}].price`}
                          fieldValue={room.price}
                          rules={[{ required: true, message: '请输入价格' }, { min: 0, message: '价格不能为负数' }]}
                          style={{ flex: 1 }}
                        >
                          <InputNumber
                            placeholder="请输入价格"
                            value={room.price}
                            onChange={(value) => handleRoomTypeChange(index, 'price', value)}
                            min={0}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Button
                          danger
                          icon={<MinusOutlined />}
                          onClick={() => removeRoomType(index)}
                          style={{ alignSelf: 'flex-end', marginBottom: 16 }}
                        >
                          删除
                        </Button>
                      </Space>

                      <Form.Item
                        label="房型设施"
                        fieldKey={`roomTypes[${index}].amenities`}
                        fieldValue={room.amenities}
                      >
                        <Input
                          placeholder="请输入房型设施，多个设施用逗号分隔"
                          value={room.amenities.join(',')}
                          onChange={(e) => handleRoomTypeChange(index, 'amenities', e.target.value.split(','))}
                        />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
              </Space>
            )}
          </Card>

          {/* 提交按钮 */}
          <Space size="middle">
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitLoading}>
              保存
            </Button>
            <Button
              type="default"
              onClick={() => navigate('/merchant')}
              disabled={submitLoading}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => form.validateFields().then(values => handleSubmitAudit(values))}
              loading={submitLoading}
            >
              保存并提交审核
            </Button>
          </Space>
        </Form>
      )}
    </div>
  )
}

export default HotelFormPage
