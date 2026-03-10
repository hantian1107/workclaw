# Workclaw 需求与设计文档

## 项目愿景

Workclaw 是一个**本地优先 (Local-First)**、**高度可控**且**具备远程扩展能力**的桌面级 AI 智能体平台。它旨在成为开发者的“第二双手”，既能在本地高效地辅助代码编写和文件管理，又能通过飞书等即时通讯工具随时随地接受远程指令。

与 OpenClaw 等大型分布式 Agent 平台不同，Workclaw 专注于个人和小型团队的场景，强调**轻量化**、**隐私安全**和**无缝集成**。

## 核心功能需求

1.  **多模态交互通道 (Multi-Channel Interaction)**
    *   **本地 GUI**: 提供现代化的 Electron 界面，支持富文本对话、文件拖拽、即时预览。
    *   **远程 IM**: 集成飞书 (Feishu) 等企业级 IM，支持通过聊天窗口远程控制本地电脑上的 Agent。

2.  **工作空间管理 (Workspace Management)**
    *   **逻辑分组**: 支持创建多个工作空间，每个工作空间可以包含来自不同磁盘位置的多个文件夹（File Links）和应用（App Links）。
    *   **上下文隔离**: 不同工作空间拥有独立的对话历史、配置和权限范围。
    *   **动态切换**: 用户可以随时在 UI 或通过命令切换当前激活的工作空间。

3.  **安全沙箱机制 (Logical Sandbox)**
    *   **白名单策略**: Agent 只能访问当前激活工作空间内明确列出的资源（文件/文件夹）。
    *   **权限拦截**: 所有的原子能力调用（如写文件、运行命令）都必须经过沙箱的路径校验。

4.  **智能体能力体系 (Capability & Skill)**
    *   **原子能力 (Capabilities)**: 提供底层操作，如 `File.read`, `File.write`, `Shell.exec`, `Browser.open`。
    *   **业务技能 (Skills)**: 基于原子能力编排的高级任务，如“代码审查”、“日志分析”、“项目脚手架生成”。

5.  **文件系统深度集成**
    *   支持大文件读取、全文本搜索、代码高亮显示。
    *   支持在对话中直接引用文件上下文。

## 系统架构设计 (Hexagonal Architecture)

Workclaw 采用简化的六边形架构，以 Electron 主进程为内核，通过适配器连接外部世界。

```mermaid
graph TD
    %% --- 1. 接入层 (Access Layer) ---
    subgraph Access [接入层 (Clients)]
        ElectronRenderer[Electron Renderer (React UI)]
        FeishuClient[飞书/钉钉 (External App)]
    end

    %% --- 2. 主进程内核 (Main Process Kernel) ---
    subgraph MainProcess [Electron 主进程 (Main Process)]
        
        %% A. 通道适配器 (Channel Adapters)
        subgraph Channels [通道适配器 (Channel Adapters)]
            IPC_Channel[IPC Handler (UI 通信)]
            Feishu_Channel[HTTP Server (Webhook 监听)]
        end

        %% B. 智能体运行时 (Agent Runtime)
        subgraph AgentRuntime [智能体运行时 (The Brain)]
            SessionMgr[会话管理器 (Session Manager)]
            Planner[规划器 (Planner & Router)]
            LLM_Service[模型服务 (LLM Service)]
            Context[上下文记忆 (Context Memory)]
        end

        %% C. 技能编排层 (Skill Orchestration)
        subgraph Skills [技能编排 (Skills)]
            CodeSkill[代码助手技能]
            WriterSkill[写作技能]
            SearchSkill[搜索技能]
        end

        %% D. 安全执行层 (Secure Execution)
        subgraph Executor [安全执行器 (Secure Executor)]
            CapabilityMgr[能力管理器 (Capability Manager)]
            Sandbox[逻辑沙箱 (Logical Sandbox)]
            Whitelist[白名单策略 (Whitelist Policy)]
        end

        %% E. 资源管理层 (Resource Management)
        subgraph Resources [资源管理 (Resource Manager)]
            WorkspaceMgr[工作空间管理器 (Workspace Manager)]
            ConfigStore[配置存储 (Store)]
        end

    end

    %% --- 3. 基础设施层 (Infrastructure) ---
    subgraph Infra [基础设施 (OS Level)]
        FileSystem[文件系统 (Node.js FS)]
        Shell[系统 Shell]
        Browser[浏览器实例]
    end

    %% --- 数据流向与交互 ---
    
    %% 1. 用户指令流入
    ElectronRenderer -->|IPC Invoke| IPC_Channel
    FeishuClient -->|HTTP Post| Feishu_Channel
    
    %% 2. 统一路由与会话
    IPC_Channel -->|UserMessage| SessionMgr
    Feishu_Channel -->|UserMessage| SessionMgr
    
    SessionMgr -->|Dispatch| Planner
    Planner -->|Think| LLM_Service
    
    %% 3. 技能调用
    Planner -->|Call Skill| Skills
    Skills -->|Invoke Capability| CapabilityMgr
    
    %% 4. 安全检查 (关键路径)
    CapabilityMgr -->|Request Access| Sandbox
    Sandbox -->|Check Whitelist| WorkspaceMgr
    WorkspaceMgr -->|Return Resource List| Whitelist
    
    Whitelist -->|Allow/Deny| Sandbox
    
    %% 5. 实际执行
    Sandbox -->|Execute| Infra
```

## 技术栈选择

### 前端 (Renderer Process)
- **React + TypeScript**: 构建用户界面的基石。
- **Tailwind CSS + shadcn/ui**: 快速构建美观、一致的 UI 组件。
- **Zustand**: 轻量级状态管理，用于同步 Workspace 列表和 UI 状态。
- **Lucide React**: 统一的图标库。

### 后端 (Main Process)
- **Electron**: 跨平台桌面应用框架。
- **Node.js**: 提供底层系统访问能力。
- **Koa / Express (Lightweight)**: 用于飞书 Webhook 的 HTTP 服务器。
- **Better-SQLite3 / Lowdb**: 本地轻量级数据库，用于存储 Workspace 配置和对话历史。
- **OpenAI Node SDK**: 连接 LLM 服务。

### 构建与工具
- **Vite**: 极速构建工具，支持 Electron HMR。
- **Electron Builder**: 打包发布。

## 关键流程设计

### 1. 启动与初始化
1.  Electron 主进程启动。
2.  初始化 `ConfigStore`，加载用户配置。
3.  初始化 `WorkspaceMgr`，加载上次激活的工作空间。
4.  启动 `IPC_Channel` 监听 UI 事件。
5.  如果配置了飞书，启动 `Feishu_Channel` 监听端口。
6.  创建并显示主窗口。

### 2. 飞书远程控制流程
1.  用户在飞书发送消息 "@Agent 帮我检查一下 logs 目录"。
2.  飞书服务器发送 POST 请求到本地 `Feishu_Channel`。
3.  `Feishu_Channel` 验证签名，解析消息，封装为 `UserMessage`。
4.  `SessionMgr` 根据飞书 `open_id` 查找绑定的 `workspace_id`。
5.  `AgentRuntime` 处理消息，Planner 决定调用 `ListFiles` 能力。
6.  `CapabilityMgr` 请求 `Sandbox` 检查 `logs` 目录权限。
7.  检查通过，执行 `fs.readdir`。
8.  结果返回给 Agent，Agent 生成回复。
9.  `Feishu_Channel` 将回复发送回飞书。

### 3. 工作空间切换流程
1.  用户在 UI 点击 "Project Beta"。
2.  前端发送 IPC 消息 `workspace:switch`。
3.  `WorkspaceMgr` 更新 `currentWorkspaceId`。
4.  `Sandbox` 重新加载 Project Beta 的白名单规则。
5.  `Context` 切换到 Project Beta 的对话历史。
6.  通知 UI 刷新界面。
