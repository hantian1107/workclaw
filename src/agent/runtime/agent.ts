import { sessionManager } from './session';
import { planner } from './planner';
import { contextManager } from './context';
import { workspaceManager } from '../../core/workspace';

export interface AgentResponse {
  sessionId: string;
  content: string;
  toolUsed?: string;
  toolResult?: string;
}

export class AgentRuntime {
  /**
   * Main entry point for processing user messages.
   */
  async processMessage(channelId: string, userId: string, content: string): Promise<AgentResponse> {
    // 1. Get or create session
    const session = sessionManager.getSession(channelId, userId);
    
    // 2. Set active workspace for this request
    try {
        workspaceManager.setActiveWorkspace(session.workspaceId);
    } catch (e) {
        // Fallback to default if workspace is invalid
        console.warn(`Workspace ${session.workspaceId} not found, falling back to default`);
        workspaceManager.setActiveWorkspace('default');
    }

    // 3. Plan action (using new LLM-based planner)
    const plan = await planner.plan(session.id, content);

    let responseContent = plan.content;
    let toolResult: string | undefined;

    // 4. Execute tool if needed
    if (plan.action === 'tool_call' && plan.toolCall) {
      try {
        toolResult = await planner.executeTool(plan.toolCall.name, plan.toolCall.args);
        
        // Optionally, we could feed the tool result back to the LLM for a final response
        // For now, we just append the result
        responseContent = `Tool executed: ${plan.toolCall.name}\n\nResult:\n${toolResult}`;
      } catch (error: any) {
        toolResult = `Error: ${error.message}`;
        responseContent = `Failed to execute tool: ${error.message}`;
      }
    }

    // 5. Save assistant response
    contextManager.addMessage(session.id, 'assistant', responseContent);

    return {
      sessionId: session.id,
      content: responseContent,
      toolUsed: plan.toolCall?.name,
      toolResult
    };
  }
}

export const agentRuntime = new AgentRuntime();
