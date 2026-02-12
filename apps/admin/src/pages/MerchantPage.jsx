import { Typography, Card } from 'antd'

const { Title, Paragraph } = Typography

const MerchantPage = () => {
  return (
    <div>
      <Title level={2}>商户管理页面</Title>
      <Card style={{ marginBottom: 24 }}>
        <Paragraph>
          这里是商户管理页面的占位内容。
        </Paragraph>
        <Paragraph>
          商户可以在这里进行酒店信息的录入、编辑、提交审核等操作。
        </Paragraph>
        <Paragraph>
          后续将根据需求实现具体功能。
        </Paragraph>
      </Card>
    </div>
  )
}

export default MerchantPage