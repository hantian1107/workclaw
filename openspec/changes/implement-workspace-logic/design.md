## 背景

当前的 `WorkspaceManager` 实现是基于内存且易失的。前端依赖于 `MainAPI` 提供的模拟数据。为了使工作空间管理功能完全可用，我们需要将工作空间数据持久化到本地数据库，并通过 IPC 将前端连接到后端。

## 目标 / 非目标

**目标:**
- 使用 `better-sqlite3` 实现工作空间的持久化存储。
- 实现工作空间和资源的完整 CRUD 操作。
- 通过 Electron IPC 暴露工作空间操作。
- 将前端组件连接到真实的后端 API。
- 确保工作空间状态（例如，上次激活的工作空间）得以保留。

**非目标:**
- 远程工作空间同步（未来范围）。
- 超出基本读/写标志的高级资源权限管理（未来范围）。
- 工作空间模板或克隆（未来范围）。

## 技术方案

### 1. 数据库架构 (SQLite)

我们将使用 `better-sqlite3` 管理存储在用户应用数据目录中的本地 SQLite 数据库。

**表结构:**

- `workspaces`
  - `id` (TEXT, PK): UUID
  - `name` (TEXT): 工作空间名称
  - `description` (TEXT): 描述
  - `created_at` (TEXT): ISO 时间戳
  - `updated_at` (TEXT): ISO 时间戳
  - `is_active` (INTEGER): 布尔标志 (0/1) 用于跟踪上次激活的工作空间（或存储在单独的配置表中）

- `resources`
  - `id` (TEXT, PK): UUID
  - `workspace_id` (TEXT, FK -> workspaces.id)
  - `path` (TEXT): 资源的绝对路径
  - `type` (TEXT): 'file' | 'directory' | 'app'
  - `permissions` (TEXT): 'read' | 'write' | 'execute' | 'all'

### 2. 后端架构

- **数据库服务**: 一个单例 `DatabaseService`，用于处理连接和查询执行。采用模块化初始化设计，主 `initDatabase` 函数负责建立连接并调用各模块的初始化函数（如 `initWorkspaceDatabase`）。
- **WorkspaceManager**: 重构以使用 `DatabaseService` 而非内存 `Map`。
- **IPC 处理程序**:
  - `workspace:create`: (name, description) -> Workspace
  - `workspace:list`: () -> Workspace[]
  - `workspace:get`: (id) -> Workspace
  - `workspace:update`: (id, updates) -> Workspace
  - `workspace:delete`: (id) -> boolean
  - `workspace:resource:add`: (workspaceId, resource) -> boolean
  - `workspace:resource:remove`: (workspaceId, resourceId) -> boolean
  - `workspace:switch`: (id) -> boolean

### 3. 前端架构

- **API 层**: 更新 `window.electron.workspace` 以调用 `ipcRenderer.invoke`。
- **状态管理**: 更新 Zustand store 以在初始化时从真实 API 获取数据。
- **UI 组件**: 确保组件优雅地处理加载状态和错误。

## 决策

1. **选择 `better-sqlite3` 而非 `lowdb`**
   - **理由**: 虽然 `lowdb` 对 JSON 更简单，但 `better-sqlite3` 提供了更好的性能、可靠性和查询能力（SQL），这将随着数据模型的增长（例如，存储聊天记录、日志）而受益。
   - **替代方案**: `lowdb`（更简单但扩展性较差），`sqlite3`（原生绑定复杂）。

2. **IPC 通信风格**
   - **选择**: `ipcRenderer.invoke` / `ipcMain.handle`（双向异步）。
   - **理由**: 大多数工作空间操作是异步的（数据库 I/O）且需要响应（成功/数据）。

3. **ID 生成**
   - **选择**: `uuid` 库。
   - **理由**: 用于分布式就绪设计的标准、防冲突 ID 生成。

## 风险 / 权衡

- **风险**: 如果多个窗口访问数据库，可能会出现 SQLite 文件锁定问题。
  - **缓解措施**: 使用单个主进程服务来管理所有数据库连接。渲染进程必须通过 IPC 进行访问。
- **风险**: 架构迁移。
  - **缓解措施**: 实现一个简单的迁移系统，或在启动时检查架构并在表不存在时创建表。

## 迁移计划

1. 在应用启动时初始化 SQLite 数据库。
2. 如果表不存在，则创建表。
3. （可选）迁移任何现有的配置（如果适用，目前没有）。
