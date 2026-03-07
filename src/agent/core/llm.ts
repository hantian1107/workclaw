interface LLMConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

interface LLMResponse {
  text: string;
  tokens: {
    prompt: number;
    completion: number;
  };
}

class MiniMaxClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL: string = 'https://api.minimax.chat/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async chat(model: string, messages: Array<{ role: string; content: string }>, options: any = {}): Promise<any> {
    const url = `${this.baseURL}/text/chatcompletion_v2`;
    
    const payload = {
      model: model,
      messages: messages,
      ...options
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MiniMax API Error:', error);
      throw error;
    }
  }
}

class LLMService {
  private client: MiniMaxClient;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new MiniMaxClient(config.apiKey);
  }

  // 生成响应
  async generate(prompt: string, _context?: string): Promise<LLMResponse> {
    try {
      console.log('Generating response for prompt:', prompt);
      console.log('Using model:', this.config.model);
      
      const result = await this.client.chat(this.config.model, [
        { role: 'user', content: prompt }
      ], {
        temperature: this.config.temperature
      });
      
      return {
        text: result.choices[0].message.content,
        tokens: {
          prompt: result.usage.prompt_tokens,
          completion: result.usage.completion_tokens
        }
      };
    } catch (error) {
      console.error('Error generating LLM response:', error);
      // 发生错误时返回模拟响应
      return {
        text: `I'm sorry, I encountered an error. Please try again later.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tokens: {
          prompt: prompt.length,
          completion: 100
        }
      };
    }
  }

  // 生成带有上下文的响应
  async generateWithContext(prompt: string, context: string[]): Promise<LLMResponse> {
    try {
      const messages = context.map((msg, index) => {
        // 简单处理，假设奇数索引为用户，偶数索引为助手
        const role = index % 2 === 0 ? 'user' : 'assistant';
        return { role, content: msg };
      });
      
      // 添加最新的用户消息
      messages.push({ role: 'user', content: prompt });
      
      console.log('Generating response with context:', messages);
      console.log('Using model:', this.config.model);
      
      const result = await this.client.chat(this.config.model, messages, {
        temperature: this.config.temperature
      });
      
      return {
        text: result.choices[0].message.content,
        tokens: {
          prompt: result.usage.prompt_tokens,
          completion: result.usage.completion_tokens
        }
      };
    } catch (error) {
      console.error('Error generating LLM response with context:', error);
      // 发生错误时返回模拟响应
      return {
        text: `I'm sorry, I encountered an error. Please try again later.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tokens: {
          prompt: prompt.length + context.join('').length,
          completion: 100
        }
      };
    }
  }
}

// 在浏览器环境中提供默认值
export const llmService = new LLMService({
  apiKey: 'sk-cp-Kd6E6WMqkYjEDwiOaboVMM7kG2CfEH3DnP3EEVxUmJd10mat8_TydYbLOO-5orjY_CCYcsZPr6VD9rLtwOChgCQtE4v11X1Y7Umq3WjngSkj_OlCfyPWCdw',
  model: 'abab6.5s-chat',
  temperature: 0.7
});