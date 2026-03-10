import { contextManager } from './context';
import { fileCapability } from '../../core/capabilities/file';
import { shellCapability } from '../../core/capabilities/shell';

export interface PlanResult {
  action: 'chat' | 'tool_call';
  content: string;
  toolCall?: {
    name: string;
    args: any;
  };
}

export class Planner {
  /**
   * Analyzes the user's message and decides on the next action.
   * In a real implementation, this would call an LLM.
   * For now, we implement a simple rule-based planner for demonstration.
   */
  async plan(sessionId: string, userMessage: string): Promise<PlanResult> {
    // Save user message to history
    contextManager.addMessage(sessionId, 'user', userMessage);

    const lowerMsg = userMessage.toLowerCase();

    // Simple rule-based intent detection
    if (lowerMsg.startsWith('/ls') || lowerMsg.includes('list files')) {
      const dir = lowerMsg.replace('/ls', '').replace('list files', '').trim() || '.';
      return {
        action: 'tool_call',
        content: `I will list files in ${dir}`,
        toolCall: {
          name: 'file:list',
          args: { path: dir }
        }
      };
    }

    if (lowerMsg.startsWith('/read') || lowerMsg.includes('read file')) {
      const file = lowerMsg.replace('/read', '').replace('read file', '').trim();
      if (!file) {
        return { action: 'chat', content: 'Please specify a file to read.' };
      }
      return {
        action: 'tool_call',
        content: `I will read file ${file}`,
        toolCall: {
          name: 'file:read',
          args: { path: file }
        }
      };
    }

    if (lowerMsg.startsWith('/exec') || lowerMsg.includes('run command')) {
        const cmd = lowerMsg.replace('/exec', '').replace('run command', '').trim();
        if (!cmd) {
            return { action: 'chat', content: 'Please specify a command to run.' };
        }
        return {
            action: 'tool_call',
            content: `I will run command ${cmd}`,
            toolCall: {
                name: 'shell:exec',
                args: { command: cmd }
            }
        };
    }

    // Default to chat
    return {
      action: 'chat',
      content: `I received your message: "${userMessage}". I am a simple planner for now.`
    };
  }

  /**
   * Executes the tool call and returns the result.
   */
  async executeTool(toolName: string, args: any): Promise<string> {
    try {
      switch (toolName) {
        case 'file:list':
          const files = await fileCapability.list(args.path);
          return `Files in ${args.path}:\n${files.join('\n')}`;
        case 'file:read':
          const content = await fileCapability.read(args.path);
          return `Content of ${args.path}:\n${content}`;
        case 'shell:exec':
            const { stdout, stderr } = await shellCapability.exec(args.command);
            return `Command output:\n${stdout}\n${stderr ? `Errors:\n${stderr}` : ''}`;
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error: any) {
      return `Error executing ${toolName}: ${error.message}`;
    }
  }
}

export const planner = new Planner();
