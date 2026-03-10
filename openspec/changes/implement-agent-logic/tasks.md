## 1. LLM Service Implementation

- [x] 1.1 Install OpenAI Node SDK
- [x] 1.2 Implement `src/agent/core/llm.ts` to wrap OpenAI SDK
- [x] 1.3 Update `src/core/config.ts` to support LLM configuration

## 2. Skills Implementation

- [x] 2.1 Create `src/agent/skills/coding/index.ts` with read/write/list logic
- [x] 2.2 Create `src/agent/skills/writer/index.ts` with summarization logic
- [x] 2.3 Create `src/agent/skills/search/index.ts` using BrowserCapability
- [x] 2.4 Implement `src/agent/skills/registry.ts` to manage skills

## 3. Planner Upgrade

- [x] 3.1 Refactor `src/agent/runtime/planner.ts` to use LLM Service
- [x] 3.2 Create system prompt with tool definitions
- [x] 3.3 Implement tool execution logic in Planner

## 4. Integration & Testing

- [x] 4.1 Update `src/agent/runtime/agent.ts` to use new Planner
- [x] 4.2 Verify Coding Skill via IPC (Skipped per user request)
- [x] 4.3 Verify Writer Skill via Feishu (mock) (Skipped per user request)
