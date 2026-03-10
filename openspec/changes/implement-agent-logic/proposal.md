## Why

架构重构已经完成，现在需要实现 Agent 的核心业务逻辑（Skill）以及对 Capabilities 的编排。这包括实现实际的文件读写、代码编写、搜索等技能，并确保它们正确调用底层的原子能力，同时支持通过飞书进行远程调用。

## What Changes

*   **实现 Skills**：
    *   `CodingSkill`：基于 LLM 的代码编写、重构和审查。
    *   `WriterSkill`：基于 LLM 的文档编写和内容生成。
    *   `SearchSkill`：基于浏览器能力的网络搜索。
*   **增强 Planner**：将现有的硬编码规划器升级为基于 LLM 的智能规划器，能够解析自然语言并调用正确的 Skill。
*   **完善 LLM 服务**：实现与 Minimax/OpenAI 的对接，支持流式输出和工具调用（Function Calling）。
*   **完善 Context 管理**：支持更复杂的上下文窗口管理和历史记录压缩。

## Capabilities

### New Capabilities

- `coding-skill`: 代码编写、修改和分析的高级技能。
- `writer-skill`: 文档撰写、摘要和内容生成技能。
- `search-skill`: 网络搜索和信息获取技能。
- `llm-service`: 统一的大模型调用服务，支持多 Provider。

### Modified Capabilities

- `agent-runtime`: 升级 Planner 和 Session 逻辑以支持 Skill 调用。

## Impact

*   **代码新增**：主要集中在 `src/agent/skills/` 和 `src/agent/core/llm.ts`。
*   **依赖变更**：可能需要引入 `openai` SDK 或其他 HTTP 客户端库。
*   **配置变更**：需要在 `config.json` 中配置 LLM API Key。
