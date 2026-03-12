## 1. 数据库设置

- [x] 1.1 创建 `src/main/db/index.ts` 以初始化 `better-sqlite3` 连接。
- [x] 1.2 创建 `src/main/db/workspace.ts` 并实现 `initWorkspaceDatabase` 函数，用于创建 `workspaces` 和 `resources` 表。
- [x] 1.3 在 `src/main/db/index.ts` 的 `initDatabase` 中调用 `initWorkspaceDatabase`。
- [x] 1.4 添加迁移逻辑以确保架构是最新的。

## 2. 工作空间管理器实现

- [x] 2.1 重构 `WorkspaceManager` 以接受 `DatabaseService` 或初始化它。
- [x] 2.2 使用 SQL INSERT 实现 `createWorkspace`。
- [x] 2.3 使用 SQL SELECT 实现 `getWorkspace` 和 `getAllWorkspaces`。
- [x] 2.4 使用 SQL UPDATE/DELETE 实现 `updateWorkspace` 和 `deleteWorkspace`。
- [x] 2.5 使用 SQL 操作在 `resources` 表上实现 `addResource` 和 `removeResource`。
- [x] 2.6 实现 `setCurrentWorkspace` 的持久化（例如，存储在配置表或单独的文件中）。

## 3. IPC 层集成

- [x] 3.1 创建 `src/main/ipc/workspace.ts` 以定义 IPC 处理程序。
- [x] 3.2 为所有工作空间操作（`create`, `list`, `get`, `update`, `delete`, `switch`, `resource:add`, `resource:remove`）注册 IPC 处理程序。
- [x] 3.3 确保 IPC 处理程序优雅地处理错误并返回适当的响应。

## 4. 前端集成

- [x] 4.1 更新 `src/preload/index.ts`（或相关的预加载文件），通过 `contextBridge` 暴露 `workspace` API。
- [x] 4.2 更新 `src/renderer/src/service/api.ts`，使用 `window.electron.workspace` 代替模拟数据。
- [x] 4.3 验证 `WorkspaceManagementView` 和 `WorkspaceSelector` 是否可以使用真实数据工作。

## 5. 验证

- [ ] 5.1 验证创建工作空间在应用重启后是否持久存在。
- [ ] 5.2 验证切换工作空间在应用重启后是否持久存在。
- [ ] 5.3 验证添加资源在应用重启后是否持久存在。
