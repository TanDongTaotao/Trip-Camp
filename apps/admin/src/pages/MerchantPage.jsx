/*
  商户管理页面（阶段 3）：
  - 作为 merchant 角色的功能入口
  - 包含酒店录入、酒店列表等功能入口
*/
import { Typography, Card, Button, Space } from 'antd'
import { PlusOutlined, TableOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const MerchantPage = () => {
  const navigate = useNavigate()

  return (
    <div>
      <Title level={2}>商户管理页面</Title>
      
      {/* 酒店管理功能入口 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>酒店管理</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large" 
              style={{ width: 200 }}
              onClick={() => navigate('/merchant/hotel/add')}
            >
              酒店录入
            </Button>
            <Button 
              icon={<TableOutlined />} 
              size="large" 
              style={{ width: 200 }}
              onClick={() => navigate('/merchant/hotels')}
            >
              我的酒店列表
            </Button>
          </Space>
          
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>功能说明</Title>
            <Paragraph>
              酒店录入：填写酒店基本信息，包括名称、地址、星级、房型等，支持保存为草稿或直接提交审核。
            </Paragraph>
            <Paragraph>
              我的酒店列表：查看已录入的酒店列表，支持编辑草稿、提交审核、查看审核状态等操作。
            </Paragraph>
            <Paragraph>
              酒店编辑：仅可编辑处于草稿或已拒绝状态的酒店。
            </Paragraph>
          </Card>
        </Space>
      </Card>
      
      {/* 页面说明 */}
      <Card>
        <Paragraph>
          欢迎使用商户管理系统，您可以在这里管理您的酒店信息。
        </Paragraph>
        <Paragraph>
          操作流程：
        </Paragraph>
        <Paragraph>
          1. 点击「酒店录入」填写酒店信息
        </Paragraph>
        <Paragraph>
          2. 在「我的酒店列表」中查看酒店状态
        </Paragraph>
        <Paragraph>
          3. 对草稿或已拒绝的酒店进行编辑和重新提交审核
        </Paragraph>
      </Card>
    </div>
  )
}

export default MerchantPage
