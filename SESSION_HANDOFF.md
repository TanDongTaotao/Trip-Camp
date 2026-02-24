# Trip-Camp 项目交接提示词

**角色设定**
你是一个经验丰富的全栈开发工程师，正在与我结对编程开发 "Trip-Camp" 项目。该项目是一个包含移动端（Taro/React）、管理端（React/Ant Design）和后端（Node.js/Express/MongoDB）的单体仓库（Monorepo）。

**当前项目状态**
我们目前处于 **阶段 3**：商户录入 + 管理员审核/发布。

- **后端**：已完成商户和管理员的 CRUD 接口，包括软删除逻辑。
- **管理端**：已完成商户酒店列表（录入/编辑/删除）和管理员审核列表（审核/发布/下线/删除）。
- **移动端**：已完成首页和详情页的基本展示优化。

**最近完成的任务 (Context)**
在之前的会话中，我们完成了以下修改，请基于此上下文继续工作：

1. **移动端优化**：
    - 修改了 [detail/index.jsx](file:///F:/PycharmProjects/Trip-Camp/apps/mobile/src/pages/detail/index.jsx)，将酒店详情页的日期显示格式从 "YYYY-MM-DD" 修改为 "MM月DD日"（去除了年份）。

2. **后端功能增强**：
    - 在 [merchant.js](file:///F:/PycharmProjects/Trip-Camp/server/src/routes/merchant.js) 中新增了 `DELETE /api/v1/merchant/hotels/:id` 接口。
        - **逻辑**：仅允许商户删除 **自己名下** (`ownerId` 匹配) 的酒店。
        - **实现**：采用软删除（`deletedAt = new Date()`，`onlineStatus = 'offline'`）。
    - 确认 [admin.js](file:///F:/PycharmProjects/Trip-Camp/server/src/routes/admin.js) 中已存在管理员删除接口（软删除，无 owner 限制）。

3. **管理端功能增强**：
    - **商户端**：在 [MerchantHotelListPage.jsx](file:///F:/PycharmProjects/Trip-Camp/apps/admin/src/pages/MerchantHotelListPage.jsx) 的表格操作列中添加了“删除”按钮。
        - 调用接口：`DELETE /merchant/hotels/:id`。
        - 交互：带二次确认弹窗。
    - **管理员端**：在 [AdminAuditPage.jsx](file:///F:/PycharmProjects/Trip-Camp/apps/admin/src/pages/AdminAuditPage.jsx) 的表格操作列中添加了“删除”按钮。
        - 调用接口：`DELETE /admin/hotels/:id`。
        - 交互：带二次确认弹窗。

**代码规范与注意事项**

- **文件路径**：总是使用绝对路径引用文件。
- **删除逻辑**：项目中统一使用 **软删除**（检查 `deletedAt` 字段），不进行物理删除。
- **权限控制**：
  - **Merchant**：只能操作 `ownerId` 等于自己的数据。
  - **Admin**：拥有全局权限。
- **日期格式**：前端展示层倾向于人性化显示（如 "MM月DD日"），后端存储统一为 ISO Date 或时间戳。

**下一步建议**

- 如果用户没有新的指令，可以建议进行端到端测试，或者开始下一阶段（如订单系统）的开发。
- 目前管理端的 Lint 和 Build 已通过验证。

请基于以上信息，准备好接收新的任务指令。
