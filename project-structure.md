# Workclaw 项目结构文档

## 项目结构总览

Workclaw 是一个基于 Electron 和 React 的桌面应用程序，采用**六边形架构 (Hexagonal Architecture)** 的变体，强调**核心逻辑 (Agent Core)** 与**外部接口 (Channels)** 的分离，以及**能力 (Capabilities)** 与**业务技能 (Skills)** 的分层。

## 项目结构树

```text
workclaw/
├── .trae/                 # Trae IDE 配置文件
├── build/                 # 构建输出目录
├── dist/                  # Electron 主进程构建输出
├── dist-electron/         # Electron 预加载脚本构建输出
├── public/                # 静态资源 (图标, HTML 模板)
├── src/
│   ├── agent/             # [核心] 智能体业务逻辑 (The Brain)
│   │   ├── runtime/       # 运行时环境
│   │   │   ├── session.ts      # 会话管理 (Channel -> Workspace 映射)
│   │   │   ├── planner.ts      # 规划器 (Intent Analysis)
│   │   │   └── context.ts      # 上下文记忆 (Memory)
│   │   ├── skills/        # [技能层] 高级业务逻辑 (Orchestration)
│   │   │   ├── coding/         # 代码助手技能
│   │   │   ├── writer/         # 写作技能
│   │   │   └── search/         # 搜索技能
│   │   └── types.ts       # Agent 相关类型定义
│   │
│   ├── core/              # [内核] 系统核心与安全 (The Kernel)
│   │   ├── sandbox.ts          # [关键] 逻辑沙箱与权限校验
│   │   ├── workspace.ts        # 工作空间管理 (资源白名单)
│   │   ├── capabilities/       # [能力层] 原子操作 (Atomic Capabilities)
│   │   │   ├── file.ts         # 文件读写 (受限)
│   │   │   ├── shell.ts        # 系统命令 (受限)
│   │   │   └── browser.ts      # 浏览器控制
│   │   └── config.ts           # 全局配置管理
│   │
│   ├── channels/          # [接入层] 通信适配器 (Adapters)
│   │   ├── base.ts             # IChannel 接口定义
│   │   ├── ipc/                # Electron IPC 通道 (UI 通信)
│   │   └── feishu/             # 飞书 Webhook 通道 (远程通信)
│   │
│   ├── main/              # [主进程] Electron 入口 (Infrastructure)
│   │   ├── index.ts            # 应用初始化, 模块组装
│   │   ├── preload.ts          # 预加载脚本 (安全桥接)
│   │   └── window.ts           # 窗口管理
│   │
│   └── renderer/          # [渲染进程] React UI (Presentation)
│       ├── components/         # UI 组件 (shadcn/ui)
│       ├── hooks/              # React Hooks
│       ├── stores/             # 状态管理 (Zustand)
│       ├── views/              # 页面视图
│       ├── App.tsx             # 应用入口
│       └── main.tsx            # 渲染入口
│
├── tests/                 # 测试目录
├── electron-builder.json  # 打包配置
├── package.json           # 依赖管理
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 构建配置
└── workflow.md            # 项目需求文档
```

## 核心模块职责说明

### 1. `src/agent/` (智能体层)
负责处理用户的意图，编排技能，维护对话状态。它**不直接操作底层资源**，而是通过 `capabilities` 进行操作。
- **runtime/**: 包含智能体的核心循环：接收消息 -> 规划 -> 执行技能 -> 返回结果。
- **skills/**: 定义了智能体“会做什么”。例如 `CodeReviewSkill` 可能会调用文件读取能力和 LLM 服务。

### 2. `src/core/` (系统内核层)
负责系统的安全性、资源管理和原子能力的实现。这是**安全沙箱**的所在地。
- **sandbox.ts**: 拦截所有对 `capabilities` 的调用，检查操作的目标路径是否在当前激活的 `workspace` 白名单内。
- **capabilities/**: 提供最底层的操作，如 `fs.readFile`, `exec`。这些函数在执行前必须通过 `sandbox` 的检查。
- **workspace.ts**: 管理工作空间的配置（ID, 名称, 包含的文件夹路径）。

### 3. `src/channels/` (接入层)
负责将外部世界的异构消息转换为内部统一的 `UserMessage` 格式。
- **ipc/**: 处理来自 Electron 渲染进程的消息。
- **feishu/**: 启动一个轻量级 HTTP Server，处理飞书的回调事件。

### 4. `src/main/` (主进程)
Electron 的入口点。它负责：
1.  初始化 `Config`, `WorkspaceManager`, `AgentRuntime`。
2.  加载并启动所有 `Channels` (IPC, Feishu)。
3.  管理应用生命周期和窗口。

### 5. `src/renderer/` (UI 层)
纯粹的展示层。它不包含任何 Agent 逻辑或文件操作逻辑，所有操作都通过 `window.electron.ipcRenderer` 发送给主进程。

## 关键设计决策

1.  **去网关化 (No Gateway)**: 直接使用 `Channels` 适配器在主进程内处理消息，避免了本地 HTTP 网关的开销和复杂性。
2.  **Skill vs Capability**:
    - **Skill**: 业务逻辑 (如 "重构代码")，由 Prompt 和逻辑流组成。
    - **Capability**: 原子能力 (如 "写文件")，由代码实现，受沙箱控制。
3.  **逻辑沙箱 (Logical Sandbox)**: 通过 `Workspace` 定义的资源白名单，在 `Capability` 执行前进行路径校验，确保 Agent 只能操作授权的文件/目录。
4.  **动态会话 (Dynamic Session)**: Agent 实例与 Workspace 是解耦的。通过 `SessionManager`，飞书用户和 UI 用户可以分别绑定到不同的 Workspace，互不干扰。
