import OpenAI from 'openai';
import { configManager } from '../../core/config';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';

export class LLMService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const config = configManager.getConfig().llm;
    
    // Initialize OpenAI client with configuration
    // Minimax and other providers are OpenAI-compatible, so we just change the baseURL
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || (config.provider === 'minimax' ? 'https://api.minimax.chat/v1' : undefined),
      dangerouslyAllowBrowser: true // Allow running in Electron renderer if needed, though this runs in main/agent
    });
    this.model = config.model;
  }

  /**
   * Refreshes the client configuration (e.g. after config update)
   */
  public refreshConfig(): void {
    const config = configManager.getConfig().llm;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || (config.provider === 'minimax' ? 'https://api.minimax.chat/v1' : undefined),
    });
    this.model = config.model;
  }

  /**
   * Generates a chat completion
   */
  async chat(
    messages: ChatCompletionMessageParam[],
    tools?: ChatCompletionTool[],
    stream = false
  ): Promise<any> { // Typing 'any' for now to support both stream and non-stream, can be refined
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools,
        stream,
      });
      return response;
    } catch (error: any) {
      console.error('LLM API Call Failed:', error);
      throw new Error(`LLM Service Error: ${error.message}`);
    }
  }
}

export const llmService = new LLMService();
