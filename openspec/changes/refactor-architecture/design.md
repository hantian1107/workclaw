## Context

WorkClaw 当前是一个基于 Electron 的本地应用，缺乏清晰的模块边界。Agent 逻辑分散在 UI 组件和主进程中，导致无法安全地开放给外部通道（如飞书）。我们需要重构为一个六边形架构，使核心逻辑（Agent Runtime）独立于外部接口（Channels），并引入安全沙箱（Sandbox）来控制文件访问。

## Goals / Non-Goals

**Goals:**
*   建立清晰的六边形架构，分离 Agent Runtime、Core、Channels 和 UI。
*   实现 IPC 和 HTTP（飞书）双通道支持，且共享同一套 Agent 逻辑。
*   实现基于 Workspace 白名单的逻辑沙箱，拦截非授权的文件操作。
*   实现 Skill（业务）与 Capability（能力）的分层设计。

**Non-Goals:**
*   不引入复杂的微服务架构或分布式消息队列（保持本地轻量级）。
*   不重写现有的 React UI 组件库（仅调整数据流）。
*   暂不实现多 Agent 协同（目前仅单 Agent 多会话）。

## Decisions

### 1. 去网关化设计
*   **Decision**: 不使用独立的 API Gateway 服务，而是让 Electron 主进程直接加载 Channel 适配器。
*   **Rationale**: 本地应用不需要负载均衡或复杂的路由，直接函数调用（Function Call）或轻量级 HTTP Server 更高效，且减少部署复杂度。
*   **Alternatives**: 使用本地 Nginx 或独立的 Node.js Gateway 进程（过于复杂）。

### 2. 逻辑沙箱 (Logical Sandbox)
*   **Decision**: 在 Capability 层实现路径检查，而非在操作系统层面（如 Docker/chroot）。
*   **Rationale**: 用户需要操作宿主机上的真实文件，Docker 隔离性太强且配置麻烦。逻辑检查足够应对“误操作”和“非恶意”的越权。
*   **Alternatives**: 使用 WASM 或 Docker 容器运行 Agent（实现成本高，文件映射复杂）。

### 3. 动态会话绑定
*   **Decision**: 使用 `SessionManager` 维护 `(ChannelID, UserID) -> WorkspaceID` 的映射表。
*   **Rationale**: 飞书是无状态的，需要一个中间层来维持“上下文”。UI 是有状态的，也需要映射到对应的 Workspace 实例。
*   **Alternatives**: 在 Agent 内部硬编码 Workspace ID（无法支持多任务并发）。

## Risks / Trade-offs

*   **[Risk] 安全漏洞**: 逻辑沙箱可能存在路径遍历（Path Traversal）漏洞。
    *   **Mitigation**: 使用 Node.js 的 `path.resolve` 和 `path.relative` 严格检查路径归属，禁止 `..` 跳转。
*   **[Risk] 性能开销**: 每次文件操作都进行正则匹配和路径检查。
    *   **Mitigation**: 路径检查是内存操作，开销极小（微秒级），相比磁盘 I/O 可忽略不计。
*   **[Risk] 状态同步**: UI 和飞书同时操作同一个文件可能导致冲突。
    *   **Mitigation**: 暂不处理文件级锁，依赖用户自行协调（类似 Git 冲突）。
