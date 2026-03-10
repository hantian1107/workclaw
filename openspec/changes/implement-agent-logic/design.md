## Context

WorkClaw 的基础架构（六边形架构）已搭建完毕，但 Agent 目前还是一个简单的规则引擎（if-else），无法处理复杂任务。我们需要引入真正的 LLM 能力，并实现基于技能（Skill）的业务逻辑。当前系统已具备文件和 Shell 的原子能力，但缺乏高层逻辑来调用它们。

## Goals / Non-Goals

**Goals:**
*   实现统一的 LLM Service，支持 OpenAI 兼容接口。
*   实现智能规划器（Smart Planner），利用 LLM 进行意图识别和参数提取。
*   实现 Coding Skill：支持读取代码、分析问题、生成修复方案并写入文件。
*   实现 Writer Skill：支持基于上下文生成文档。
*   实现 Search Skill：支持利用浏览器能力获取信息。

**Non-Goals:**
*   暂不支持多 Agent 协作（如 Manager-Worker 模式）。
*   暂不支持复杂的长期记忆（Vector Database）。
*   暂不实现本地模型推理（依赖外部 API）。

## Decisions

### 1. LLM 服务设计
*   **Decision**: 使用 OpenAI Node SDK 作为底层客户端，因为 Minimax 等主流模型均支持 OpenAI 兼容协议。
*   **Rationale**: 减少重复造轮子，利用社区成熟的 SDK 处理流式传输和重试。
*   **Configuration**: 在 `config.ts` 中配置 `baseUrl`, `apiKey`, `model`。

### 2. Skill 接口设计
*   **Decision**: 每个 Skill 实现 `ISkill` 接口，包含 `execute(args, context)` 方法。
*   **Rationale**: 统一调用方式，方便 Planner 动态分发任务。
*   **Registry**: 使用一个简单的 `SkillRegistry` Map 来管理所有可用技能。

### 3. Planner 升级
*   **Decision**: 使用 ReAct (Reasoning + Acting) 模式或 Function Calling。
*   **Rationale**: 对于指令型任务，Function Calling 更稳定；对于复杂推理，ReAct 更灵活。鉴于 WorkClaw 侧重于工具使用，首选 Function Calling。
*   **Prompt**: 系统提示词需明确列出当前 Workspace 可用的工具和技能。

## Risks / Trade-offs

*   **[Risk] Token 消耗**: 包含大量文件内容作为 Context 可能导致 Token 溢出或费用过高。
    *   **Mitigation**: 实现简单的 Context 截断策略，或仅传递文件摘要/路径。
*   **[Risk] 幻觉问题**: LLM 可能生成不存在的文件路径。
    *   **Mitigation**: 依赖现有的 Sandbox 路径检查机制，如果路径无效则抛出错误并反馈给 LLM 让其重试。
