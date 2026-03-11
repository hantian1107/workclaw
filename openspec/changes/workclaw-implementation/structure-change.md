# Workclaw 项目结构改动说明

## 1. 结构改动概述

根据智能体系统构建思考和项目需求，对Workclaw项目结构进行以下调整：

### 1.1 智能体模块调整
- 新增智能体循环实现文件，替代原有的planner.ts
- 新增utils文件夹，用于管理上下文、对话和特殊提示词
- 新增LLM模块，提供模型调用服务

### 1.2 核心模块调整
- 优化核心模块结构，明确职责分工
- 工作空间管理独立为单独文件夹

### 1.3 其他模块调整
- 保持通道适配器、主进程和渲染进程的基本结构
- 确保各模块间的清晰边界和通信方式

## 2. 新的完整项目结构

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
│   │   │   ├── context.ts      # 上下文记忆 (Memory)
│   │   │   └── agent.ts        # 智能体循环实现 (新增)
│   │   ├── utils/         # 工具函数 (新增)
│   │   │   ├── context.ts      # 上下文管理
│   │   │   ├── conversation.ts # 对话管理
│   │   │   └── prompts.ts      # 特殊提示词管理
│   │   ├── llm/           # LLM 服务 (新增)
│   │   │   └── llmService.ts   # 模型调用服务
│   │   ├── skills/        # [技能层] 高级业务逻辑 (Orchestration)
│   │   │   ├── coding/         # 代码助手技能
│   │   │   ├── writer/         # 写作技能
│   │   │   └── search/         # 搜索技能
│   │   └── types.ts       # Agent 相关类型定义
│   │
│   ├── core/              # [内核] 系统核心与安全 (The Kernel)
│   │   ├── sandbox.ts          # [关键] 逻辑沙箱与权限校验
│   │   ├── core.ts             # 核心主进程 (新增)
│   │   ├── capabilities/       # [能力层] 原子操作 (Atomic Capabilities)
│   │   │   ├── file.ts         # 文件读写 (受限)
│   │   │   ├── shell.ts        # 系统命令 (受限)
│   │   │   └── browser.ts      # 浏览器控制
│   │   └── config.ts           # 全局配置管理
│   │
│   ├── workspace/          # [工作空间] 工作空间管理 (新增)
│   │   └── workspace.ts        # 工作空间管理
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

## 3. 主要改动说明

### 3.1 智能体模块改动

| 改动内容 | 目的 |
|---------|------|
| 新增 agent.ts | 实现智能体循环，负责整理上下文、系统提示词、角色提示词、特殊提示词，处理工具调用 |
| 新增 utils 文件夹 | 提供上下文管理、对话管理和特殊提示词管理等工具函数 |
| 新增 llm 文件夹 | 提供模型调用服务，封装LLM API调用逻辑 |
| 移除 planner.ts | 智能体循环功能已集成到 agent.ts 中 |

### 3.2 核心模块改动

| 改动内容 | 目的 |
|---------|------|
| 新增 core.ts | 核心主进程，用于解析指令，根据工作空间鉴权，分配到相应的工具 |
| 优化 capabilities 结构 | 保持文件、shell和浏览器能力的实现 |

### 3.3 工作空间模块改动

| 改动内容 | 目的 |
|---------|------|
| 新增 workspace 文件夹 | 将工作空间管理独立为单独模块，便于维护和扩展 |
| 迁移 workspace.ts | 将原有的 workspace.ts 从 core 目录迁移到新的 workspace 目录 |

### 3.4 其他模块改动

| 改动内容 | 目的 |
|---------|------|
| 保持 channels 结构 | 维持 IPC 和飞书通道的实现，飞书通道暂时预留 |
| 保持 main 结构 | 维持应用初始化、预加载脚本和窗口管理的实现 |
| 保持 renderer 结构 | 维持 UI 组件、Hooks、状态管理和页面视图的实现 |

## 4. 模块职责说明

### 4.1 智能体模块 (agent/)
- **runtime/agent.ts**: 实现智能体循环，处理用户输入，调用LLM，处理工具调用
- **utils/**: 提供上下文管理、对话管理和提示词管理等工具
- **llm/llmService.ts**: 封装LLM API调用，提供模型服务
- **skills/**: 实现各种业务技能，如代码助手、写作、搜索等

### 4.2 核心模块 (core/)
- **core.ts**: 核心主进程，解析指令，管理能力调用
- **sandbox.ts**: 逻辑沙箱，进行权限校验
- **capabilities/**: 实现原子能力，如文件操作、系统命令、浏览器控制
- **config.ts**: 全局配置管理

### 4.3 工作空间模块 (workspace/)
- **workspace.ts**: 工作空间管理，维护工作空间配置和资源白名单

### 4.4 接入层 (channels/)
- **base.ts**: 定义IChannel接口
- **ipc/**: 处理来自渲染进程的消息
- **feishu/**: 处理来自飞书的远程消息（预留）

### 4.5 主进程 (main/)
- **index.ts**: 应用初始化，模块组装
- **preload.ts**: 预加载脚本，安全桥接
- **window.ts**: 窗口管理

### 4.6 渲染进程 (renderer/)
- **components/**: UI组件
- **hooks/**: React Hooks
- **stores/**: 状态管理
- **views/**: 页面视图
- **App.tsx**: 应用入口
- **main.tsx**: 渲染入口

## 5. 技术实现要点

### 5.1 智能体循环实现
- 实现完整的智能体循环：接收消息 → 处理上下文 → 调用LLM → 处理工具调用 → 返回结果
- 支持工具调用和直接回答两种模式
- 管理对话历史和上下文信息

### 5.2 LLM服务实现
- 封装OpenAI API调用
- 支持不同模型的配置和切换
- 实现错误处理和重试机制

### 5.3 安全沙箱实现
- 基于工作空间的资源白名单
- 拦截所有能力调用，进行权限校验
- 实现路径解析和规范化，防止路径遍历攻击

### 5.4 工作空间管理实现
- 支持多个工作空间的创建和切换
- 维护工作空间的资源白名单
- 实现工作空间配置的持久化存储

## 6. 开发优先级

1. **核心模块**：实现core.ts、sandbox.ts和基本能力
2. **工作空间模块**：实现workspace.ts和工作空间管理功能
3. **智能体模块**：实现agent.ts和智能体循环
4. **LLM模块**：实现llmService.ts和模型调用
5. **接入层**：实现IPC通道，确保本地GUI交互
6. **主进程**：实现应用初始化和窗口管理
7. **渲染进程**：实现用户界面
8. **技能模块**：实现各种业务技能
9. **飞书通道**：最后实现，作为扩展功能

## 7. 测试策略

- **单元测试**：测试各个模块的核心功能
- **集成测试**：测试模块间的交互
- **端到端测试**：测试完整的用户流程
- **安全测试**：测试沙箱机制的有效性
- **性能测试**：测试大文件处理和系统响应速度

## 8. 部署计划

- **开发环境**：使用Vite进行开发和热重载
- **构建打包**：使用Electron Builder打包应用
- **发布渠道**：提供Windows、macOS和Linux版本
- **版本管理**：使用语义化版本控制，定期发布更新
