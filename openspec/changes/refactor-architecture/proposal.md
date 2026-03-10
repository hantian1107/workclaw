## Why

WorkClaw 目前的架构偏向单体桌面应用，Agent 逻辑与 UI 深度耦合，导致难以集成飞书等外部通道，且缺乏有效的安全边界。通过重构为六边形架构（Hexagonal Architecture），将核心逻辑（Agent Runtime）与外部接口（Channels）分离，并引入逻辑沙箱（Sandbox），可以实现“一次编写，多处运行”，同时保障文件操作的安全性。这不仅是为了解决当前飞书集成的问题，更是为了 WorkClaw 长期的可扩展性和安全性打下基础。

## What Changes

*   **架构重构**：将系统重构为六边形架构，核心分为 Agent Runtime（大脑）、Channels（接入层）、Core（内核层）和 UI（展示层）。
*   **去网关化**：移除潜在的独立网关设计，直接在主进程中使用 Channel 适配器处理多源消息。
*   **Skill 与 Capability 分离**：
    *   将原子操作（如文件读写、命令执行）封装为 `Capabilities`，受沙箱控制。
    *   将业务逻辑（如代码审查、项目生成）封装为 `Skills`，编排 Capabilities。
*   **逻辑沙箱引入**：新增 `Sandbox` 模块，基于当前激活的 `Workspace` 白名单对所有 Capability 调用进行路径校验。
*   **动态会话管理**：新增 `SessionManager`，支持飞书用户和 UI 用户分别绑定不同的 Workspace，实现多路并发。
*   **文档更新**：更新 `project-structure.md` 和 `workflow.md` 以反映新架构。

## Capabilities

### New Capabilities

- `agent-runtime`: 智能体核心运行时，包含会话管理、规划器和上下文记忆。
- `channel-adapter`: 通道适配器层，支持 IPC（UI）和 HTTP（飞书）消息的标准化接入。
- `security-sandbox`: 逻辑沙箱与权限控制核心，负责拦截和校验 Capability 调用。
- `workspace-core`: 工作空间核心管理，负责资源白名单的配置与加载。
- `capability-system`: 原子能力系统，封装受限的文件、系统和浏览器操作。

### Modified Capabilities

<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

*   **代码结构**：`src/` 目录将发生重大变化，新增 `agent/`, `core/`, `channels/` 等顶级目录。
*   **依赖变更**：可能需要引入轻量级 HTTP Server 库（如 Koa/Express）用于飞书通道，以及 Better-SQLite3 用于状态存储。
*   **UI 交互**：前端需要适配新的 IPC 消息格式，但 UI 表现层变化不大。
*   **安全性**：所有文件操作将受到严格限制，不再允许随意访问系统文件。
