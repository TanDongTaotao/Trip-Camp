import { Typography, Card } from 'antd'

const { Title, Paragraph } = Typography

const AdminPage = () => {
  return (
    <div>
      <Title level={2}>管理员管理页面</Title>
      <Card style={{ marginBottom: 24 }}>
        <Paragraph>
          这里是管理员管理页面的占位内容。
        </Paragraph>
        <Paragraph>
          管理员可以在这里进行酒店信息的审核、发布、下线等操作。
        </Paragraph>
        <Paragraph>
          后续将根据需求实现具体功能。
        </Paragraph>
      </Card>
    </div>
  )
}

export default AdminPage