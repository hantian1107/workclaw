## 为什么

当前的工作空间接口由模拟数据和无持久化的内存实现支持。我们需要实现带有数据持久化和正确 IPC 通信的实际工作空间逻辑，以支持“工作空间管理”这一核心功能，使用户能够可靠地创建、切换和管理工作空间。

## 变更内容

- 实现带有持久化存储的 `WorkspaceManager`（根据本地优先架构，使用 `better-sqlite3` 或基于文件的 JSON 存储）。
- 将 Electron IPC 处理程序连接到 `WorkspaceManager` 方法。
- 更新 `preload.ts` 以暴露完整的工作空间 API。
- 用对实际实现的调用替换 `MainAPI` 中的模拟数据。
- 确保工作空间状态（当前工作空间、资源列表）在应用重启后得以保留。

## 能力

### 新增能力
- `workspace-persistence`: 工作空间配置和状态的持久化存储机制。

### 修改的能力
- `workspace-management`: 更新以包含持久化需求和错误处理规范。

## 影响

- **后端**: `src/main/` (IPC 处理程序, 服务层), `src/workspace/` (WorkspaceManager 实现)。
- **前端**: `src/renderer/` (API 集成更新)。
- **依赖**: 如果尚未存在，可能需要添加 `better-sqlite3` 或 `lowdb`。
- **数据**: 工作空间配置的新数据存储位置。
