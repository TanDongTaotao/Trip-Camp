# Trip-Camp

Trip-Camp 为三端分离的酒店项目：用户端、管理端、服务端。本 README 汇总技术栈、数据库设计、目录结构与接口说明。

## 技术栈

### 用户端（apps/mobile）

- Taro 4 + React 18 + Webpack5 runner
- H5 运行端
- UI：NutUI React Taro 版
- 插件：@tarojs/plugin-html

### 管理端（apps/admin）

- React 18
- Vite 5
- Ant Design 5
- React Router 6
- Axios

### 服务端（server）

- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT 鉴权、bcryptjs 密码哈希
- nodemon 开发热重启

## 目录结构

```text
Trip-Camp/
  apps/
    mobile/                 # 用户端（Taro 项目）
    admin/                  # 管理端（React+AntD 项目）
  server/                   # 服务端（Express 项目）
    src/
      routes/               # 路由定义（auth/hotels/merchant/admin）
      controllers/          # 控制器
      middlewares/          # 鉴权、角色校验、错误处理等
      models/               # 数据模型（User/Hotel）
      utils/                # JWT、密码加密、错误码等工具
  apifox-openapi.yaml        # 接口文档（OpenAPI）
  接口注释说明文档.txt        # 接口说明（状态机、错误码、落地顺序）
  数据库设计说明.md           # 数据库设计说明
  目录结构与分工说明.md        # 目录结构与分工说明
```

## 数据库设计（MongoDB）

### 集合规划

- users：账号与角色（merchant/admin）
- hotels：酒店信息、房型、审核/上线状态机、商户归属

### users 关键字段

- username（唯一）
- passwordHash
- role（merchant | admin）
- createdAt / updatedAt

### hotels 关键字段

基础信息：

- nameCn / nameEn
- address / city / star / openTime

房型与价格：

- roomTypes（name/price/amenities）
- minPrice（列表页“起价”）

管理流程与归属：

- ownerId（商户归属）
- auditStatus（draft | pending | approved | rejected）
- onlineStatus（offline | online）
- rejectReason
- updateStatus / updateRejectReason / updatePayload
- deletedAt

用户端展示：

- images / coverImage / tags

## 接口说明

### 基本约定

- Base URL：/api/v1
- 鉴权：Bearer Token（Authorization: Bearer <token>）
- 角色：merchant / admin

接口文档：

- OpenAPI：apifox-openapi.yaml

### 核心接口

用户端（Taro）：

- GET /hotels
- GET /hotels/:id

管理端（商户）：

- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /merchant/hotels
- PUT /merchant/hotels/:id
- POST /merchant/hotels/:id/submit
- GET /merchant/hotels

管理端（管理员）：

- GET /admin/hotels
- POST /admin/hotels/:id/audit
- POST /admin/hotels/:id/publish
- POST /admin/hotels/:id/offline
- DELETE /admin/hotels/:id

### 酒店状态机

审核状态 auditStatus：

- draft → pending → approved / rejected

上下线状态 onlineStatus：

- offline ↔ online

流程：

- 商户新建/编辑：draft
- 提交审核：draft/rejected → pending
- 管理员审核：pending → approved/rejected（拒绝需原因）
- 发布上线：approved + offline → online
- 下线：online → offline
- 已上线酒店信息修改：
  - 保存修改：updateStatus=draft
  - 提交修改审核：updateStatus=pending
  - 管理员审核修改：pending → none/rejected（拒绝需原因）
  - 审核通过后：将 updatePayload 覆盖到酒店字段
