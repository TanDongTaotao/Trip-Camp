/*
  管理员占位页（阶段 0/1/2）：
  - 作为 admin 角色的功能入口占位
  - 阶段 2：添加审核/发布/下线列表入口占位
  - 阶段 3：实现具体业务逻辑
*/
import { Typography, Card, Button, Space } from 'antd'
import { CheckCircleOutlined, PublishOutlined, CloseCircleOutlined, TableOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const AdminPage = () => {
  return (
    <div>
      <Title level={2}>管理员管理页面</Title>
      
      {/* 阶段 3 入口占位 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>酒店审核管理（阶段 3 功能入口）</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle">
            <Button type="primary" icon={<CheckCircleOutlined />} size="large" style={{ width: 200 }}>
              审核酒店
            </Button>
            <Button icon={<PublishOutlined />} size="large" style={{ width: 200 }}>
              发布酒店
            </Button>
            <Button icon={<CloseCircleOutlined />} size="large" style={{ width: 200 }}>
              下线酒店
            </Button>
          </Space>
          
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>审核列表（阶段 3）</Title>
            <Paragraph>
              这里将显示待审核的酒店列表，包括酒店名称、提交时间、操作等信息。
            </Paragraph>
            <Button icon={<TableOutlined />}>
              查看审核列表
            </Button>
          </Card>
          
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>已发布列表（阶段 3）</Title>
            <Paragraph>
              这里将显示已发布的酒店列表，包括酒店名称、发布时间、操作等信息。
            </Paragraph>
            <Button icon={<TableOutlined />}>
              查看已发布列表
            </Button>
          </Card>
        </Space>
      </Card>
      
      {/* 页面说明 */}
      <Card>
        <Paragraph>
          这里是管理员管理页面的占位内容。
        </Paragraph>
        <Paragraph>
          管理员可以在这里进行酒店信息的审核、发布、下线等操作。
        </Paragraph>
        <Paragraph>
          阶段 3 将实现具体功能。
        </Paragraph>
      </Card>
    </div>
  )
}

export default AdminPage
