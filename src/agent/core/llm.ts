/**
 * LLM 服务
 * 提供与 MiniMax API 的交互功能，用于生成 AI 响应
 */

/**
 * LLM 配置接口
 * 定义 LLM 服务的配置参数
 */
interface LLMConfig {
  /** API 密钥 */
  apiKey: string;
  /** 模型名称 */
  model: string;
  /** 温度参数，控制生成文本的随机性 */
  temperature: number;
}

/**
 * LLM 响应接口
 * 定义 LLM 服务的响应结构
 */
interface LLMResponse {
  /** 生成的文本内容 */
  text: string;
  /** 令牌使用情况 */
  tokens: {
    /** 提示令牌数 */
    prompt: number;
    /** 完成令牌数 */
    completion: number;
  };
}

/**
 * MiniMax 客户端类
 * 负责与 MiniMax API 进行交互
 */
class MiniMaxClient {
  /** API 密钥 */
  private apiKey: string;
  /** API 基础 URL */
  private baseURL: string;

  /**
   * 构造函数
   * @param apiKey API 密钥
   * @param baseURL API 基础 URL，默认值为 'https://api.minimax.chat/v1'
   */
  constructor(apiKey: string, baseURL: string = 'https://api.minimax.chat/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  /**
   * 发送聊天请求
   * @param model 模型名称
   * @param messages 消息数组
   * @param options 额外选项
   * @returns Promise<any> API 响应
   * @throws 如果 API 调用失败则抛出错误
   */
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

/**
 * LLM 服务类
 * 提供生成 AI 响应的功能
 */
class LLMService {
  /** MiniMax 客户端实例 */
  private client: MiniMaxClient;
  /** LLM 配置 */
  private config: LLMConfig;

  /**
   * 构造函数
   * @param config LLM 配置
   */
  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new MiniMaxClient(config.apiKey);
  }

  /**
   * 生成响应
   * @param prompt 提示文本
   * @param _context 上下文（未使用）
   * @returns Promise<LLMResponse> LLM 响应
   */
  async generate(prompt: string, _context?: string): Promise<LLMResponse> {
    try {
      console.log('Generating response for prompt:', prompt);
      console.log('Using model:', this.config.model);
      
      // 调用 MiniMax 客户端生成响应
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

  /**
   * 生成带有上下文的响应
   * @param prompt 提示文本
   * @param context 上下文消息数组
   * @returns Promise<LLMResponse> LLM 响应
   */
  async generateWithContext(prompt: string, context: string[]): Promise<LLMResponse> {
    try {
      // 构建消息数组
      const messages = context.map((msg, index) => {
        // 简单处理，假设奇数索引为用户，偶数索引为助手
        const role = index % 2 === 0 ? 'user' : 'assistant';
        return { role, content: msg };
      });
      
      // 添加最新的用户消息
      messages.push({ role: 'user', content: prompt });
      
      console.log('Generating response with context:', messages);
      console.log('Using model:', this.config.model);
      
      // 调用 MiniMax 客户端生成响应
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

/**
 * LLM 服务实例
 * 在浏览器环境中提供默认值
 */
export const llmService = new LLMService({
  apiKey: 'sk-cp-Kd6E6WMqkYjEDwiOaboVMM7kG2CfEH3DnP3EEVxUmJd10mat8_TydYbLOO-5orjY_CCYcsZPr6VD9rLtwOChgCQtE4v11X1Y7Umq3WjngSkj_OlCfyPWCdw',
  model: 'abab6.5s-chat',
  temperature: 0.7
});