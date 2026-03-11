import type { ISkill } from '../../types';
import { llmService } from '../../core/llm';

export class WriterSkill implements ISkill {
  name = 'writer';
  description = 'Generate content, summaries, and documentation';

  async execute(args: any): Promise<any> {
    const { action, content, topic, format } = args;

    switch (action) {
      case 'summarize':
        return await this.summarize(content);
      case 'generate':
        return await this.generate(topic, format);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async summarize(content: string): Promise<string> {
    try {
      const response = await llmService.chat([
        { role: 'system', content: 'You are a helpful assistant capable of summarizing complex text.' },
        { role: 'user', content: `Please summarize the following text:\n\n${content}` }
      ]);
      return response.choices[0].message.content || 'Failed to generate summary.';
    } catch (error: any) {
      return `Error summarizing content: ${error.message}`;
    }
  }

  private async generate(topic: string, format: string = 'markdown'): Promise<string> {
    try {
      const response = await llmService.chat([
        { role: 'system', content: `You are a professional technical writer. Output format: ${format}` },
        { role: 'user', content: `Write a comprehensive document about: ${topic}` }
      ]);
      return response.choices[0].message.content || 'Failed to generate content.';
    } catch (error: any) {
      return `Error generating content: ${error.message}`;
    }
  }
}

export const writerSkill = new WriterSkill();
