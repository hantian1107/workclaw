import OpenAI from 'openai';

class LLMService {
  private openai: OpenAI | null = null;
  private model: string = 'gpt-3.5-turbo';

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  setApiKey(apiKey: string): void {
    this.openai = new OpenAI({ apiKey });
  }

  setModel(model: string): void {
    this.model = model;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.openai) {
      return 'Error: API key not set';
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error calling LLM API:', error);
      return 'Error: Failed to generate response from LLM';
    }
  }

  async generateWithTools(prompt: string, tools: any[]): Promise<string> {
    if (!this.openai) {
      return 'Error: API key not set';
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: tools,
        tool_choice: 'auto',
        max_tokens: 1000,
        temperature: 0.7
      });

      return JSON.stringify(response.choices[0]) || '';
    } catch (error) {
      console.error('Error calling LLM API with tools:', error);
      return 'Error: Failed to generate response from LLM';
    }
  }
}

export { LLMService };
