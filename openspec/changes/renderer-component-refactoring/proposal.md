## Why

当前App.tsx文件包含了所有的UI逻辑，代码结构混乱，不利于维护和扩展。需要将组件和页面进行合理的拆分，提高代码的可维护性和复用性，同时新增工作空间管理页面功能。

## What Changes

- 将App.tsx中的工作空间管理组件拆分到renderer/component/WorkspaceSelector.tsx
- 将App.tsx中的对话管理组件拆分到renderer/component/ConversationList.tsx
- 将对话页面封装到renderer/view/ChatView.tsx
- 新增工作空间管理页面renderer/view/WorkspaceManagementView.tsx
- 配置路由映射，使用react-router-dom支持在主内容区切换ChatView和WorkspaceManagementView
- 在工作空间管理组件中新增按钮，通过路由跳转切换到工作空间管理页面
- 工作空间管理页面支持创建新工作空间和添加资源到工作空间

## Capabilities

### New Capabilities
- `component-refactoring`: 组件拆分和重构，提高代码可维护性
- `workspace-management-ui`: 工作空间管理页面UI，支持创建工作空间和添加资源
- `router-setup`: 路由配置，支持页面切换

### Modified Capabilities
- 无现有功能的需求变更，仅重构实现方式

## Impact

- 受影响代码：src/renderer/App.tsx
- 新增文件：
  - src/renderer/component/WorkspaceSelector.tsx
  - src/renderer/component/ConversationList.tsx
  - src/renderer/view/ChatView.tsx
  - src/renderer/view/WorkspaceManagementView.tsx
- 新增依赖：react-router-dom（已安装）
