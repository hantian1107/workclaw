## Context

当前App.tsx是一个大文件，包含了所有的UI逻辑，包括工作空间选择、对话列表、聊天界面等。这种结构不利于代码维护和扩展。项目使用React 19、TypeScript和Vite构建，没有使用路由库。

## Goals / Non-Goals

**Goals:**
- 将App.tsx中的组件拆分为独立的可复用组件
- 创建清晰的组件和页面目录结构
- 实现页面切换功能，支持聊天页面和工作空间管理页面
- 在工作空间管理组件中添加按钮，用于切换到工作空间管理页面
- 工作空间管理页面支持创建新工作空间和添加资源

**Non-Goals:**
- 不修改后端逻辑
- 不修改现有的工作空间数据结构
- 不引入复杂的状态管理（保持使用React useState）

## Decisions

### 1. 目录结构
- 使用 `src/renderer/component/` 存放可复用组件
- 使用 `src/renderer/view/` 存放页面组件
- 保持与现有代码风格一致

**理由：** 清晰的目录结构便于代码组织和查找，符合常见的React项目结构规范。

### 2. 路由方案
- 使用react-router-dom作为路由管理库
- 在main.tsx中添加BrowserRouter，App.tsx中使用Routes和Route进行路由配置

**理由：** react-router-dom是React生态中最成熟的路由解决方案，虽然目前只有两个页面，但为了未来的扩展性和规范性，决定使用react-router-dom。

**备选方案：**
- 使用React状态管理：虽然简单，但随着页面增多，管理起来会变得复杂，不利于扩展。

### 3. 组件接口设计
- WorkspaceSelector组件：接收workspaces、selectedWorkspace、onSelectWorkspace、onManageWorkspace作为props
- ConversationList组件：接收conversations、selectedConversation、onSelectConversation、onCreateConversation作为props
- ChatView组件：接收messages、inputMessage、isLoading、onSendMessage、onInputChange作为props
- WorkspaceManagementView组件：接收workspaces、onCreateWorkspace、onAddResource、onBack作为props

**理由：** 通过props传递数据和回调函数，保持组件的纯函数特性，便于测试和复用。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 组件拆分可能导致props层级过深 | 保持组件接口简洁，必要时考虑使用Context（但当前需求不需要） |
| 工作空间管理页面功能需要与后端对接 | 先实现前端UI，后续再对接后端API |
| 不使用路由库可能不利于未来扩展 | 如果未来页面增多，可以再引入react-router-dom |

## Open Questions

- 工作空间的资源类型具体包括哪些？（文件、文件夹、URL等）
- 创建工作空间时需要哪些必填字段？（名称、描述等）
