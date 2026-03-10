## 1. LLM Service Implementation

- [ ] 1.1 Install OpenAI Node SDK
- [ ] 1.2 Implement `src/agent/core/llm.ts` to wrap OpenAI SDK
- [ ] 1.3 Update `src/core/config.ts` to support LLM configuration

## 2. Skills Implementation

- [ ] 2.1 Create `src/agent/skills/coding/index.ts` with read/write/list logic
- [ ] 2.2 Create `src/agent/skills/writer/index.ts` with summarization logic
- [ ] 2.3 Create `src/agent/skills/search/index.ts` using BrowserCapability
- [ ] 2.4 Implement `src/agent/skills/registry.ts` to manage skills

## 3. Planner Upgrade

- [ ] 3.1 Refactor `src/agent/runtime/planner.ts` to use LLM Service
- [ ] 3.2 Create system prompt with tool definitions
- [ ] 3.3 Implement tool execution logic in Planner

## 4. Integration & Testing

- [ ] 4.1 Update `src/agent/runtime/agent.ts` to use new Planner
- [ ] 4.2 Verify Coding Skill via IPC
- [ ] 4.3 Verify Writer Skill via Feishu (mock)
