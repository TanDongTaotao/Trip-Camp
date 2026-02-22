/*
  管理员审核页面（阶段 3）：
  - 展示待审核的酒店列表
  - 支持按状态筛选
  - 实现审核动作（通过/拒绝）
  - 实现发布/下线功能
*/
import { useState, useEffect, useCallback } from 'react'
import { Typography, Card, Button, Space, Table, Tag, message, Modal, Input, Select, Form } from 'antd'
import { ArrowLeftOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const AdminAuditPage = () => {
  const navigate = useNavigate()

  // 列表状态
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  // 筛选状态
  const [keyword, setKeyword] = useState('')
  const [auditStatus, setAuditStatus] = useState('')
  const [onlineStatus, setOnlineStatus] = useState('')

  // 审核模态框状态
  const [auditModalVisible, setAuditModalVisible] = useState(false)
  const [auditAction, setAuditAction] = useState('') // approve 或 reject
  const [selectedHotel, setSelectedHotel] = useState(null)

  // 拒绝原因表单
  const [rejectForm] = Form.useForm()

  // 加载酒店列表
  const loadHotels = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/hotels', {
        params: {
          page: currentPage,
          pageSize: pageSize,
          keyword: keyword,
          auditStatus: auditStatus,
          onlineStatus: onlineStatus
        }
      })
      setHotels(response.list || [])
      setTotal(typeof response.total === 'number' ? response.total : 0)
    } catch (error) {
      message.error('加载酒店列表失败')
      console.error('加载酒店列表失败:', error)
      setHotels([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [auditStatus, currentPage, keyword, onlineStatus, pageSize])

  // 初始加载
  useEffect(() => {
    loadHotels()
  }, [loadHotels])

  // 处理审核
  const handleAudit = async () => {
    if (!selectedHotel) return

    setActionLoading(true)
    try {
      const isUpdateAudit = selectedHotel && selectedHotel.updateStatus === 'pending'
      let rejectReason = ''
      if (auditAction === 'reject') {
        rejectReason = await rejectForm.validateFields(['rejectReason'])
        rejectReason = rejectReason.rejectReason
      }

      await api.post(`/admin/hotels/${selectedHotel.id}/audit`, {
        action: auditAction,
        rejectReason: rejectReason
      })

      if (isUpdateAudit) {
        message.success(auditAction === 'approve' ? '修改审核通过成功' : '修改审核拒绝成功')
      } else {
        message.success(auditAction === 'approve' ? '审核通过成功' : '审核拒绝成功')
      }
      setAuditModalVisible(false)
      // 重新加载列表
      loadHotels()
    } catch (error) {
      const isUpdateAudit = selectedHotel && selectedHotel.updateStatus === 'pending'
      if (isUpdateAudit) {
        message.error(auditAction === 'approve' ? '修改审核通过失败' : '修改审核拒绝失败')
      } else {
        message.error(auditAction === 'approve' ? '审核通过失败' : '审核拒绝失败')
      }
      console.error('审核操作失败:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // 处理发布
  const handlePublish = async (hotel) => {
    setActionLoading(true)
    try {
      await api.post(`/admin/hotels/${hotel.id}/publish`)
      message.success('发布成功')
      // 重新加载列表
      loadHotels()
    } catch (error) {
      message.error('发布失败')
      console.error('发布失败:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // 处理下线
  const handleOffline = async (hotel) => {
    setActionLoading(true)
    try {
      await api.post(`/admin/hotels/${hotel.id}/offline`)
      message.success('下线成功')
      // 重新加载列表
      loadHotels()
    } catch (error) {
      message.error('下线失败')
      console.error('下线失败:', error)
    } finally {
      setActionLoading(false)
    }
  }

  // 打开审核模态框
  const openAuditModal = (hotel, action) => {
    setSelectedHotel(hotel)
    setAuditAction(action)
    setAuditModalVisible(true)
    rejectForm.resetFields()
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

  const updateStatusConfig = {
    none: { color: 'gray', text: '无修改' },
    draft: { color: 'orange', text: '修改草稿' },
    pending: { color: 'blue', text: '修改待审' },
    rejected: { color: 'red', text: '修改被拒' }
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
      title: '修改状态',
      dataIndex: 'updateStatus',
      key: 'updateStatus',
      render: (status) => {
        const config = updateStatusConfig[status] || { color: 'gray', text: '未知' }
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
      title: '修改拒绝原因',
      dataIndex: 'updateRejectReason',
      key: 'updateRejectReason',
      render: (reason) => reason || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      align: 'center',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.auditStatus === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => openAuditModal(record, 'approve')}
                loading={actionLoading}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => openAuditModal(record, 'reject')}
                loading={actionLoading}
              >
                拒绝
              </Button>
            </>
          )}
          {record.updateStatus === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => openAuditModal(record, 'approve')}
                loading={actionLoading}
              >
                修改通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => openAuditModal(record, 'reject')}
                loading={actionLoading}
              >
                修改拒绝
              </Button>
            </>
          )}
          {record.auditStatus === 'approved' && (
            <>
              {record.onlineStatus === 'offline' && (
                <Button
                  type="primary"
                  size="small"
                  icon={<UploadOutlined />}
                  onClick={() => handlePublish(record)}
                  loading={actionLoading}
                >
                  发布
                </Button>
              )}
              {record.onlineStatus === 'online' && (
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleOffline(record)}
                  loading={actionLoading}
                >
                  下线
                </Button>
              )}
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin')}>
          返回管理员管理
        </Button>
        <Title level={2}>酒店审核管理</Title>
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
            <Option value="pending">待审核</Option>
            <Option value="approved">已通过</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
          <Select
            placeholder="上下线状态"
            value={onlineStatus}
            onChange={setOnlineStatus}
            style={{ width: 150 }}
          >
            <Option value="">全部</Option>
            <Option value="online">上线</Option>
            <Option value="offline">下线</Option>
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
          rowKey="id"
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

      {/* 审核模态框 */}
      <Modal
        title={auditAction === 'approve' ? '审核通过' : '审核拒绝'}
        open={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        onOk={handleAudit}
        okText={auditAction === 'approve' ? '确认通过' : '确认拒绝'}
        cancelText="取消"
        confirmLoading={actionLoading}
      >
        <Form form={rejectForm} layout="vertical">
          {auditAction === 'reject' && (
            <Form.Item
              name="rejectReason"
              label="拒绝原因"
              rules={[{ required: true, message: '请输入拒绝原因' }]}
            >
              <TextArea rows={4} placeholder="请输入拒绝原因" />
            </Form.Item>
          )}
          {selectedHotel && (
            <Paragraph>
              酒店名称：{selectedHotel.nameCn}
            </Paragraph>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default AdminAuditPage
