import { LLMService } from './llm/llmService';
import { SessionManager } from './runtime/session';
import { ContextManager } from './utils/context';
import { ConversationManager } from './utils/conversation';
import { PromptManager } from './utils/prompts';

class Agent {
  private llmService: LLMService;
  private sessionManager: SessionManager;
  private contextManager: ContextManager;
  private conversationManager: ConversationManager;
  private promptManager: PromptManager;

  constructor() {
    this.llmService = new LLMService();
    this.sessionManager = new SessionManager();
    this.contextManager = new ContextManager();
    this.conversationManager = new ConversationManager();
    this.promptManager = new PromptManager();
  }

  async processMessage(message: string, sessionId: string): Promise<string> {
    // 获取或创建会话
    this.sessionManager.getOrCreateSession(sessionId);
    
    // 添加用户消息到对话历史
    this.conversationManager.addMessage(sessionId, 'user', message);
    
    // 获取上下文
    const context = this.contextManager.getContext(sessionId);
    
    // 构建提示词
    const prompt = this.promptManager.buildPrompt(message, context);
    
    // 调用LLM
    const response = await this.llmService.generate(prompt);
    
    // 处理LLM响应
    let result = response;
    
    // 检查是否需要工具调用
    if (this.needsToolCall(response)) {
      const toolCall = this.parseToolCall(response);
      const toolResult = await this.executeToolCall(toolCall);
      
      // 将工具结果发送回LLM
      const toolPrompt = this.promptManager.buildToolPrompt(toolResult);
      const finalResponse = await this.llmService.generate(toolPrompt);
      result = finalResponse;
    }
    
    // 添加AI回复到对话历史
    this.conversationManager.addMessage(sessionId, 'assistant', result);
    
    return result;
  }

  private needsToolCall(response: string): boolean {
    // 检查响应是否包含工具调用指令
    return response.includes('tool_call');
  }

  private parseToolCall(response: string): any {
    // 解析工具调用指令
    try {
      const toolCallMatch = response.match(/\{"tool_call":\{[^}]+\}\}/);
      if (toolCallMatch) {
        return JSON.parse(toolCallMatch[0]);
      }
      return null;
    } catch (error) {
      console.error('Error parsing tool call:', error);
      return null;
    }
  }

  private async executeToolCall(toolCall: any): Promise<string> {
    // 执行工具调用
    if (!toolCall || !toolCall.tool_call) {
      return 'Error: Invalid tool call format';
    }

    const { name } = toolCall.tool_call;
    
    // 根据工具名称执行相应的操作
    switch (name) {
      case 'file.read':
        // 调用文件读取能力
        return 'File read operation result';
      case 'file.write':
        // 调用文件写入能力
        return 'File write operation result';
      case 'shell.exec':
        // 调用系统命令能力
        return 'Shell exec operation result';
      case 'browser.open':
        // 调用浏览器控制能力
        return 'Browser open operation result';
      default:
        return `Error: Unknown tool: ${name}`;
    }
  }
}

export { Agent };
