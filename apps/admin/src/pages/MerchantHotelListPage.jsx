/*
  商户酒店列表页面（阶段 3）：
  - 展示商户自己的酒店列表
  - 支持查看酒店状态、编辑、提交审核等操作
  - 展示被拒原因
*/
import { useState, useEffect } from 'react'
import { Typography, Card, Button, Space, Table, Tag, message, Modal, Input, Select } from 'antd'
import { EditOutlined, CheckOutlined, EyeOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { Option } = Select

const MerchantHotelListPage = () => {
  const navigate = useNavigate()
  
  // 列表状态
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  
  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [auditStatus, setAuditStatus] = useState('')
  
  // 详情模态框状态
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)
  
  // 加载酒店列表
  const loadHotels = async () => {
    setLoading(true)
    try {
      // 这里需要根据后端API调整，暂时使用模拟数据
      // const response = await api.get('/merchant/hotels', {
      //   params: {
      //     page: currentPage,
      //     pageSize: pageSize,
      //     keyword: keyword,
      //     auditStatus: auditStatus
      //   }
      // })
      // setHotels(response.data.list)
      // setTotal(response.data.total)
      
      // 模拟数据
      setHotels([
        {
          id: '1',
          nameCn: '测试酒店1',
          address: '北京市朝阳区测试路1号',
          city: '北京',
          star: 3,
          minPrice: 200,
          auditStatus: 'pending',
          onlineStatus: 'offline',
          rejectReason: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          nameCn: '测试酒店2',
          address: '上海市浦东新区测试路2号',
          city: '上海',
          star: 4,
          minPrice: 400,
          auditStatus: 'rejected',
          onlineStatus: 'offline',
          rejectReason: '酒店信息不完整，请补充详细信息',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          nameCn: '测试酒店3',
          address: '广州市天河区测试路3号',
          city: '广州',
          star: 5,
          minPrice: 600,
          auditStatus: 'approved',
          onlineStatus: 'online',
          rejectReason: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      setTotal(3)
    } catch (error) {
      message.error('加载酒店列表失败')
      console.error('加载酒店列表失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 初始加载
  useEffect(() => {
    loadHotels()
  }, [currentPage, pageSize, keyword, auditStatus])
  
  // 处理编辑
  const handleEdit = (hotel) => {
    navigate(`/merchant/hotel/edit/${hotel.id}`)
  }
  
  // 处理提交审核
  const handleSubmitAudit = async (hotel) => {
    setSubmitLoading(true)
    try {
      // 这里需要根据后端API调整
      // await api.post(`/merchant/hotels/${hotel.id}/submit`)
      message.success('提交审核成功')
      // 重新加载列表
      loadHotels()
    } catch (error) {
      message.error('提交审核失败')
      console.error('提交审核失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }
  
  // 处理查看详情
  const handleViewDetail = (hotel) => {
    setSelectedHotel(hotel)
    setDetailModalVisible(true)
  }
  
  // 处理分页变化
  const handlePageChange = (page, size) => {
    setCurrentPage(page)
    setPageSize(size)
  }
  
  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1)
    loadHotels()
  }
  
  // 状态标签配置
  const auditStatusConfig = {
    pending: { color: 'blue', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
    draft: { color: 'orange', text: '草稿' }
  }
  
  const onlineStatusConfig = {
    online: { color: 'green', text: '上线' },
    offline: { color: 'gray', text: '下线' }
  }
  
  // 列配置
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'nameCn',
      key: 'nameCn',
      render: (text) => <span>{text}</span>
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city'
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      render: (star) => `${star}星`
    },
    {
      title: '最低价格',
      dataIndex: 'minPrice',
      key: 'minPrice',
      render: (price) => `¥${price}`
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      render: (status) => {
        const config = auditStatusConfig[status] || { color: 'gray', text: '未知' }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '上下线状态',
      dataIndex: 'onlineStatus',
      key: 'onlineStatus',
      render: (status) => {
        const config = onlineStatusConfig[status] || { color: 'gray', text: '未知' }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '被拒原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      render: (reason) => reason || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {(record.auditStatus === 'draft' || record.auditStatus === 'rejected') && (
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {(record.auditStatus === 'draft' || record.auditStatus === 'rejected') && (
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={() => handleSubmitAudit(record)}
              loading={submitLoading}
            >
              提交审核
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/merchant')}>
          返回商户管理
        </Button>
        <Title level={2}>我的酒店列表</Title>
      </Space>
      
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" style={{ marginBottom: 16 }}>
          <Input 
            placeholder="搜索酒店名称、地址" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select 
            placeholder="审核状态" 
            value={auditStatus}
            onChange={setAuditStatus}
            style={{ width: 150 }}
          >
            <Option value="">全部</Option>
            <Option value="draft">草稿</Option>
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </Card>
      
      {/* 酒店列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={hotels}
          key="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: handlePageChange,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
          locale={{
            emptyText: '暂无酒店数据'
          }}
        />
      </Card>
      
      {/* 详情模态框 */}
      <Modal
        title="酒店详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedHotel && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>酒店名称：</span>
              <span>{selectedHotel.nameCn}</span>
            </Space>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>城市：</span>
              <span>{selectedHotel.city}</span>
            </Space>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>地址：</span>
              <span>{selectedHotel.address}</span>
            </Space>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>星级：</span>
              <span>{selectedHotel.star}星</span>
            </Space>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>最低价格：</span>
              <span>¥{selectedHotel.minPrice}</span>
            </Space>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>审核状态：</span>
              <Tag color={auditStatusConfig[selectedHotel.auditStatus]?.color}>
                {auditStatusConfig[selectedHotel.auditStatus]?.text}
              </Tag>
            </Space>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>上下线状态：</span>
              <Tag color={onlineStatusConfig[selectedHotel.onlineStatus]?.color}>
                {onlineStatusConfig[selectedHotel.onlineStatus]?.text}
              </Tag>
            </Space>
            <Space size="middle" style={{ width: '100%' }}>
              <span style={{ fontWeight: 'bold', width: 100, display: 'inline-block' }}>被拒原因：</span>
              <span>{selectedHotel.rejectReason || '-'}</span>
            </Space>
          </Space>
        )}
      </Modal>
    </div>
  )
}

export default MerchantHotelListPage