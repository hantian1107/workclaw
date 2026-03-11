import { contextManager } from './context';
import { llmService } from '../core/llm';
import { skillRegistry } from '../skills/registry';
import type { PlanResult } from '../types';

export class Planner {
  private systemPrompt = `
You are WorkClaw, an intelligent desktop agent.
Your goal is to help the user by using the available tools.

You have access to the following tools (skills):
${JSON.stringify(skillRegistry.getToolDefinitions(), null, 2)}

When a user asks a question:
1. Analyze if you can answer directly.
2. If you need to perform an action (read file, write file, search, etc.), call the appropriate tool.
3. If the user's request is complex, break it down (though for now, just pick the best single tool).

Always prefer using tools over guessing.
  `;

  /**
   * Analyzes the user's message and decides on the next action using LLM.
   */
  async plan(sessionId: string, userMessage: string): Promise<PlanResult> {
    // Save user message to history
    contextManager.addMessage(sessionId, 'user', userMessage);

    // Get context history (simplified: last 10 messages)
    const history = contextManager.getHistory(sessionId).slice(-10).map(msg => ({
      role: msg.role === 'tool' ? 'function' : msg.role as any, // Map 'tool' to 'function' for some older OpenAI libs if needed, but 'tool' is standard now
      content: msg.content,
      // If it was a tool call, we might need more fields, but for simple chat completion history this is often enough
      // For proper tool use history, we need to reconstruct the conversation including tool_calls
    }));

    try {
      const response = await llmService.chat(
        [
          { role: 'system', content: this.systemPrompt },
          ...history,
          { role: 'user', content: userMessage }
        ],
        skillRegistry.getToolDefinitions()
      );

      const message = response.choices[0].message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        return {
          action: 'tool_call',
          content: 'I will execute a tool.',
          toolCall: {
            name: toolCall.function.name,
            args: JSON.parse(toolCall.function.arguments)
          }
        };
      }

      return {
        action: 'chat',
        content: message.content || "I'm not sure how to respond."
      };

    } catch (error: any) {
      console.error('Planner Error:', error);
      return {
        action: 'chat',
        content: `I encountered an error while planning: ${error.message}`
      };
    }
  }

  /**
   * Executes the tool call and returns the result.
   */
  async executeTool(toolName: string, args: any): Promise<string> {
    const skill = skillRegistry.get(toolName);
    if (!skill) {
      return `Error: Skill "${toolName}" not found.`;
    }

    try {
      // Execute the skill
      // We can pass a context object here if skills need access to session info
      const result = await skill.execute(args, {});
      
      // Convert result to string if it isn't
      if (typeof result === 'string') return result;
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error executing skill "${toolName}": ${error.message}`;
    }
  }
}

export const planner = new Planner();
