# Workclaw 项目结构文档

## 项目结构总览

Workclaw 是一个基于 Electron 和 React 的桌面应用程序，主要用于工作区管理和 AI 辅助功能。项目采用典型的 Electron 项目结构，分为主进程（main）和渲染进程（renderer）两部分，同时包含 AI 代理相关的核心功能。

## 项目结构图

```
src/
├── agent/             # AI 代理相关功能
│   ├── components/    # AI 相关组件
│   │   └── Chat/      # 聊天界面组件
│   └── core/          # AI 核心功能
│       ├── context.ts  # 上下文管理
│       ├── executor.ts # 命令执行器
│       └── llm.ts      # 语言模型服务
├── assets/            # 静态资源
├── main/             # Electron 主进程
│   ├── fileSystem.ts  # 文件系统服务
│   ├── index.ts       # 主进程入口
│   ├── preload.js     # 预加载脚本
│   └── workspace.ts   # 工作区服务
├── renderer/          # Electron 渲染进程
│   ├── components/    # UI 组件
│   │   ├── WorkspaceDetails.tsx  # 工作区详情组件
│   │   └── WorkspaceList.tsx     # 工作区列表组件
│   ├── stores/        # 状态管理
│   │   └── workspaceStore.ts  # 工作区状态管理
│   ├── App.tsx        # 渲染进程应用入口
│   └── index.tsx      # 渲染进程入口
├── App.tsx            # 主应用组件（Web 版本）
└── main.tsx           # 主应用入口（Web 版本）
```

## 模块功能说明

### 1. agent/ 目录

**功能**：包含 AI 代理相关的所有功能，是应用的智能核心。

#### agent/components/ 目录
- **Chat/**：聊天界面组件，提供与 AI 助手的交互界面，支持发送消息、显示历史消息和执行命令。

#### agent/core/ 目录
- **context.ts**：上下文管理，负责管理聊天历史和对话上下文。
- **executor.ts**：命令执行器，负责解析和执行 AI 生成的命令，如文件操作等。
- **llm.ts**：语言模型服务，负责与 MiniMax API 交互，生成 AI 响应。

### 2. assets/ 目录

**功能**：存放静态资源文件，如图片、图标等。

### 3. main/ 目录

**功能**：Electron 主进程代码，负责应用的启动、窗口管理和系统级操作。

- **fileSystem.ts**：文件系统服务，提供文件读写、目录操作等功能。
- **index.ts**：主进程入口，负责应用初始化、窗口创建和 IPC 通信处理。
- **preload.js**：预加载脚本，用于在渲染进程中安全地暴露 Electron API。
- **workspace.ts**：工作区服务，负责工作区的创建、管理和持久化存储。

### 4. renderer/ 目录

**功能**：Electron 渲染进程代码，负责应用的 UI 渲染和用户交互。

#### renderer/components/ 目录
- **WorkspaceDetails.tsx**：工作区详情组件，显示当前工作区的详细信息，包括文件夹列表和操作按钮。
- **WorkspaceList.tsx**：工作区列表组件，显示所有工作区，支持创建、选择和删除工作区。

#### renderer/stores/ 目录
- **workspaceStore.ts**：工作区状态管理，使用 Zustand 管理工作区相关的状态和操作。

- **App.tsx**：渲染进程应用入口，组织 UI 布局和组件。
- **index.tsx**：渲染进程入口，负责挂载 React 应用。

### 5. 根目录文件

- **App.tsx**：主应用组件（Web 版本），用于在浏览器中运行的版本。
- **main.tsx**：主应用入口（Web 版本），用于在浏览器中挂载 React 应用。

## 核心模块关系

1. **工作区管理流程**：
   - 用户通过 WorkspaceList 组件选择或创建工作区
   - WorkspaceDetails 组件显示工作区详情和文件夹列表
   - workspaceStore 管理工作区状态，与主进程的 workspaceService 通信
   - workspaceService 负责工作区的持久化存储

2. **AI 代理流程**：
   - 用户通过 Chat 组件发送消息
   - Chat 组件调用 llmService 生成 AI 响应
   - llmService 与 MiniMax API 交互获取响应
   - 如果响应包含命令，commandExecutor 会执行相应的命令
   - 执行结果会返回给用户

3. **文件操作流程**：
   - 用户通过界面或 AI 命令发起文件操作
   - 渲染进程通过 IPC 调用主进程的 fileSystemService
   - fileSystemService 执行实际的文件系统操作
   - 操作结果返回给渲染进程并显示给用户

## 技术栈

- **前端框架**：React
- **状态管理**：Zustand
- **桌面应用**：Electron
- **AI 服务**：MiniMax API
- **构建工具**：Vite
- **语言**：TypeScript

## 项目特点

1. **模块化设计**：清晰的模块划分，便于维护和扩展
2. **双环境支持**：同时支持 Electron 桌面应用和 Web 浏览器环境
3. **AI 集成**：集成 MiniMax API 提供智能助手功能
4. **工作区管理**：提供直观的工作区和文件夹管理功能
5. **文件系统操作**：支持文件的打开、保存和目录浏览

## 开发说明

- 开发模式：`npm run dev` 启动开发服务器
- Electron 开发模式：`npm run electron:dev` 启动 Electron 应用
- 构建：`npm run build` 构建生产版本

## 注意事项

- 项目使用 TypeScript，确保类型定义正确
- 主进程和渲染进程之间通过 IPC 通信
- AI 功能需要有效的 MiniMax API 密钥
- 工作区数据存储在用户的 AppData 目录中