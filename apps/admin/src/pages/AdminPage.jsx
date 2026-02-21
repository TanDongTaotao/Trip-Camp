/*
  管理员管理页面（阶段 3）：
  - 作为 admin 角色的功能入口
  - 包含酒店审核管理的功能入口
*/
import { Typography, Card, Button, Space } from 'antd'
import { CheckCircleOutlined, TableOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const AdminPage = () => {
  const navigate = useNavigate()

  return (
    <div>
      <Title level={2}>管理员管理页面</Title>

      {/* 酒店审核管理功能入口 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>酒店审核管理</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              size="large" 
              style={{ width: 200 }}
              onClick={() => navigate('/admin/audit')}
            >
              审核酒店
            </Button>
          </Space>

          <Card style={{ marginTop: 16 }}>
            <Title level={5}>功能说明</Title>
            <Paragraph>
              审核酒店：查看待审核的酒店列表，支持通过/拒绝审核，拒绝时需要填写拒绝原因。
            </Paragraph>
            <Paragraph>
              发布/下线：对已通过审核的酒店进行发布或下线操作，下线后可以再次发布。
            </Paragraph>
            <Paragraph>
              状态筛选：支持按审核状态（待审核/已通过/已拒绝）和上下线状态（上线/下线）进行筛选。
            </Paragraph>
            <Button 
              icon={<TableOutlined />}
              onClick={() => navigate('/admin/audit')}
            >
              查看审核列表
            </Button>
          </Card>
        </Space>
      </Card>

      {/* 页面说明 */}
      <Card>
        <Paragraph>
          欢迎使用管理员管理系统，您可以在这里审核和管理酒店信息。
        </Paragraph>
        <Paragraph>
          操作流程：
        </Paragraph>
        <Paragraph>
          1. 点击「审核酒店」进入审核页面
        </Paragraph>
        <Paragraph>
          2. 对符合要求的酒店点击「通过」，不符合要求的点击「拒绝」并填写原因
        </Paragraph>
        <Paragraph>
          3. 对已通过审核的酒店进行发布或下线操作
        </Paragraph>
      </Card>
    </div>
  )
}

export default AdminPage
