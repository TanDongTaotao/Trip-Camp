/*
  商户占位页（阶段 0/1/2）：
  - 作为 merchant 角色的功能入口占位
  - 阶段 2：添加酒店录入/编辑/提交审核入口占位
  - 阶段 3：实现具体业务逻辑
*/
import { Typography, Card, Button, Space } from 'antd'
import { PlusOutlined, EditOutlined, CheckOutlined, TableOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const MerchantPage = () => {
  return (
    <div>
      <Title level={2}>商户管理页面</Title>

      {/* 阶段 3 入口占位 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>酒店管理（阶段 3 功能入口）</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle">
            <Button type="primary" icon={<PlusOutlined />} size="large" style={{ width: 200 }}>
              酒店录入
            </Button>
            <Button icon={<EditOutlined />} size="large" style={{ width: 200 }}>
              酒店编辑
            </Button>
            <Button icon={<CheckOutlined />} size="large" style={{ width: 200 }}>
              提交审核
            </Button>
          </Space>

          <Card style={{ marginTop: 16 }}>
            <Title level={5}>酒店列表（阶段 3）</Title>
            <Paragraph>
              这里将显示商户已录入的酒店列表，包括酒店名称、状态、操作等信息。
            </Paragraph>
            <Button icon={<TableOutlined />}>
              查看酒店列表
            </Button>
          </Card>
        </Space>
      </Card>

      {/* 页面说明 */}
      <Card>
        <Paragraph>
          这里是商户管理页面的占位内容。
        </Paragraph>
        <Paragraph>
          商户可以在这里进行酒店信息的录入、编辑、提交审核等操作。
        </Paragraph>
        <Paragraph>
          阶段 3 将实现具体功能。
        </Paragraph>
      </Card>
    </div>
  )
}

export default MerchantPage
