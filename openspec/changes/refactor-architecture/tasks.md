## 1. Project Restructuring

- [x] 1.1 Create new directory structure (`src/agent`, `src/core`, `src/channels`)
- [x] 1.2 Move existing code to temporary location for migration reference
- [x] 1.3 Install new dependencies (Koa, Better-SQLite3 if needed)

## 2. Core & Sandbox Implementation

- [x] 2.1 Implement `src/core/workspace.ts` (Workspace Manager)
- [x] 2.2 Implement `src/core/sandbox.ts` (Logical Sandbox & Whitelist)
- [x] 2.3 Implement `src/core/capabilities/file.ts` (Secure File Capability)
- [x] 2.4 Implement `src/core/capabilities/shell.ts` (Secure Shell Capability)

## 3. Agent Runtime Implementation

- [x] 3.1 Implement `src/agent/runtime/context.ts` (Context Manager)
- [x] 3.2 Implement `src/agent/runtime/session.ts` (Session Manager)
- [x] 3.3 Implement `src/agent/runtime/planner.ts` (Basic Planner)
- [x] 3.4 Implement `src/agent/runtime/agent.ts` (Agent Orchestrator)

## 4. Channel Adapters Implementation

- [x] 4.1 Define `src/channels/base.ts` (IChannel Interface)
- [x] 4.2 Implement `src/channels/ipc/index.ts` (Electron IPC Adapter)
- [x] 4.3 Implement `src/channels/feishu/index.ts` (Feishu HTTP Adapter)

## 5. Main Process Integration

- [x] 5.1 Update `src/main/index.ts` to initialize new modules
- [x] 5.2 Wire up Channels to Session Manager
- [x] 5.3 Verify basic message flow (UI -> Agent -> UI)

## 6. Cleanup & Documentation

- [x] 6.1 Remove old `src/agent` and `src/services` code
- [x] 6.2 Update `project-structure.md` and `workflow.md` with final details
